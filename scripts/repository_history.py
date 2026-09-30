import os
import csv
from collections import Counter
from itertools import combinations
from datetime import datetime

from github import Github
from github.Auth import Token
from dotenv import load_dotenv


load_dotenv()


# Files/directories that should NOT participate in AIEE analysis
IGNORED_FILES = {
    ".gitignore",
}

IGNORED_EXTENSIONS = {
    ".pyc",
    ".pyo",
    ".class",
    ".log",
}

IGNORED_DIRECTORIES = {
    ".git",
    "__pycache__",
    "node_modules",
    ".venv",
    "venv",
    ".idea",
    ".vscode",
}


def should_ignore_file(file_path: str) -> bool:
    """
    Returns True if the file should be excluded from analysis.
    """

    normalized = file_path.replace("\\", "/")

    # Ignore directories
    parts = normalized.split("/")

    for directory in IGNORED_DIRECTORIES:
        if directory in parts:
            return True

    # Ignore specific files
    filename = os.path.basename(normalized)

    if filename in IGNORED_FILES:
        return True

    # Ignore extensions
    _, extension = os.path.splitext(filename)

    if extension.lower() in IGNORED_EXTENSIONS:
        return True

    # Ignore environment/secrets
    if filename in {".env", ".env.local", ".env.production"}:
        return True

    return False


def normalize_repo_name(repo_name: str) -> str:
    """
    Converts different GitHub repository URL formats
    into owner/repository format.
    """

    repo_name = repo_name.strip()

    repo_name = repo_name.replace("https://github.com/", "")
    repo_name = repo_name.replace("http://github.com/", "")
    repo_name = repo_name.replace("github.com/", "")

    repo_name = repo_name.strip("/")

    if repo_name.endswith(".git"):
        repo_name = repo_name[:-4]

    return repo_name


def detect_repository_history(
    repo_name: str,
    access_token: str,
    max_commits: int = 500
):
    """
    Extract historical file-change information from a GitHub repository.

    Generates:

    data/processed/commit_history.csv
    data/processed/file_dependency.csv
    data/processed/file_change_frequency.csv
    """

    repo_name = normalize_repo_name(repo_name)

    print("=" * 60)
    print("AIEE Repository History Extraction")
    print("=" * 60)

    print(f"Repository: {repo_name}")
    print(f"Maximum commits: {max_commits}")

    if not access_token:
        raise ValueError("GitHub access token is required.")

    # ---------------------------------------------------------
    # Connect to GitHub
    # ---------------------------------------------------------

    auth = Token(access_token)
    github = Github(auth=auth)

    repo = github.get_repo(repo_name)

    print("Repository loaded successfully.")
    print(f"Repository name: {repo.full_name}")

    # ---------------------------------------------------------
    # Output directory
    # ---------------------------------------------------------

    output_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data",
        "processed"
    )

    os.makedirs(output_dir, exist_ok=True)

    # ---------------------------------------------------------
    # Containers
    # ---------------------------------------------------------

    commit_records = []

    co_change_counter = Counter()
    file_change_counter = Counter()

    processed_commits = 0

    # ---------------------------------------------------------
    # Fetch commit history
    # ---------------------------------------------------------

    print("\nFetching commit history...")

    commits = repo.get_commits()

    for commit in commits:

        if processed_commits >= max_commits:
            break

        try:
            sha = commit.sha
            message = commit.commit.message.split("\n")[0]
            author = (
                commit.author.login
                if commit.author
                else commit.commit.author.name
            )

            commit_date = commit.commit.author.date

            # ---------------------------------------------
            # Get changed files
            # ---------------------------------------------

            changed_files = []

            for file in commit.files:

                filename = file.filename

                if should_ignore_file(filename):
                    continue

                changed_files.append(filename)

            # Remove duplicates
            changed_files = sorted(set(changed_files))

            if not changed_files:
                continue

            # ---------------------------------------------
            # File change frequency
            # ---------------------------------------------

            for filename in changed_files:
                file_change_counter[filename] += 1

            # ---------------------------------------------
            # Co-change relationships
            # ---------------------------------------------

            # Example:
            #
            # commit changes:
            # app.py
            # database.py
            # models.py
            #
            # creates:
            #
            # app.py <-> database.py
            # app.py <-> models.py
            # database.py <-> models.py

            for file_a, file_b in combinations(changed_files, 2):

                if file_a == file_b:
                    continue

                # Keep deterministic ordering
                pair = tuple(sorted([file_a, file_b]))

                co_change_counter[pair] += 1

            # ---------------------------------------------
            # Commit record
            # ---------------------------------------------

            commit_records.append(
                {
                    "commit_sha": sha,
                    "commit_message": message,
                    "author": author,
                    "commit_date": (
                        commit_date.isoformat()
                        if commit_date
                        else ""
                    ),
                    "files_changed": len(changed_files),
                    "changed_files": "|".join(changed_files),
                }
            )

            processed_commits += 1

            if processed_commits % 25 == 0:
                print(
                    f"Processed {processed_commits} commits..."
                )

        except Exception as error:

            print(
                f"Skipping commit because of error: {error}"
            )

    # ---------------------------------------------------------
    # Save commit history
    # ---------------------------------------------------------

    commit_history_path = os.path.join(
        output_dir,
        "commit_history.csv"
    )

    with open(
        commit_history_path,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=[
                "commit_sha",
                "commit_message",
                "author",
                "commit_date",
                "files_changed",
                "changed_files",
            ],
        )

        writer.writeheader()
        writer.writerows(commit_records)

    # ---------------------------------------------------------
    # Save file dependency / co-change data
    # ---------------------------------------------------------

    dependency_path = os.path.join(
        output_dir,
        "file_dependency.csv"
    )

    with open(
        dependency_path,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow(
            [
                "file_a",
                "file_b",
                "count",
            ]
        )

        for (file_a, file_b), count in co_change_counter.most_common():

            writer.writerow(
                [
                    file_a,
                    file_b,
                    count,
                ]
            )

    # ---------------------------------------------------------
    # Save file-change frequency
    # ---------------------------------------------------------

    frequency_path = os.path.join(
        output_dir,
        "file_change_frequency.csv"
    )

    with open(
        frequency_path,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow(
            [
                "file",
                "change_frequency",
            ]
        )

        for filename, frequency in file_change_counter.most_common():

            writer.writerow(
                [
                    filename,
                    frequency,
                ]
            )

    # ---------------------------------------------------------
    # Summary
    # ---------------------------------------------------------

    print("\n" + "=" * 60)
    print("Repository history extraction completed")
    print("=" * 60)

    print(f"Commits processed: {processed_commits}")
    print(f"Unique files found: {len(file_change_counter)}")
    print(
        f"Co-change relationships: "
        f"{len(co_change_counter)}"
    )

    print("\nGenerated files:")

    print(f"1. {commit_history_path}")
    print(f"2. {dependency_path}")
    print(f"3. {frequency_path}")

    return {
        "commits_processed": processed_commits,
        "unique_files": len(file_change_counter),
        "co_change_relationships": len(co_change_counter),
        "commit_history": commit_history_path,
        "file_dependency": dependency_path,
        "file_frequency": frequency_path,
    }


if __name__ == "__main__":

    print(
        "\nThis script is intended to be called "
        "from the AIEE backend using the user's GitHub OAuth token."
    )