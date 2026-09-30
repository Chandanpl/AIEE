import os
import csv

from github import Github
from github.Auth import Token
from dotenv import load_dotenv


load_dotenv()


# ============================================================
# FILES/DIRECTORIES TO IGNORE
# ============================================================

IGNORED_DIRECTORIES = {
    ".git",
    "__pycache__",
    "node_modules",
    ".venv",
    "venv",
    ".idea",
    ".vscode",
}

IGNORED_EXTENSIONS = {
    ".pyc",
    ".pyo",
    ".class",
    ".log",
}


def should_ignore_file(file_path: str) -> bool:
    """
    Returns True if the file should not be analyzed by AIEE.
    """

    file_path = file_path.replace("\\", "/")

    parts = file_path.split("/")

    # Ignore generated/dependency directories
    for directory in IGNORED_DIRECTORIES:
        if directory in parts:
            return True

    filename = os.path.basename(file_path)

    # Ignore generated file types
    _, extension = os.path.splitext(filename)

    if extension.lower() in IGNORED_EXTENSIONS:
        return True

    # Ignore environment/secrets
    if filename in {
        ".env",
        ".env.local",
        ".env.production",
    }:
        return True

    return False


def normalize_repo_name(repo_name: str) -> str:
    """
    Convert GitHub URL into owner/repository format.
    """

    repo_name = repo_name.strip()

    repo_name = repo_name.replace(
        "https://github.com/",
        ""
    )

    repo_name = repo_name.replace(
        "http://github.com/",
        ""
    )

    repo_name = repo_name.replace(
        "github.com/",
        ""
    )

    repo_name = repo_name.strip("/")

    if repo_name.endswith(".git"):
        repo_name = repo_name[:-4]

    return repo_name


def detect_changes(repo_name: str, access_token: str):

    print("\nStarting GitHub change detection...")

    repo_name = normalize_repo_name(repo_name)

    print(f"\nRepository: {repo_name}")

    if not access_token:
        raise ValueError(
            "GitHub access token is required."
        )

    # ========================================================
    # CONNECT TO GITHUB
    # ========================================================

    auth = Token(access_token)

    github = Github(auth=auth)

    print("GitHub OAuth token accepted.")

    repo = github.get_repo(repo_name)

    print("Repository loaded successfully!")
    print(f"Repository: {repo.full_name}")

    # ========================================================
    # GET LATEST COMMIT
    # ========================================================

    latest_commit = repo.get_commits()[0]

    print("\nLatest Commit")
    print("=" * 60)

    print(
        f"Commit ID : {latest_commit.sha}"
    )

    print(
        f"Author    : "
        f"{latest_commit.commit.author.name}"
    )

    print(
        f"Message   : "
        f"{latest_commit.commit.message.splitlines()[0]}"
    )

    # ========================================================
    # EXTRACT CHANGED FILES
    # ========================================================

    changed_files = []

    print("\nChanged Files")
    print("=" * 60)

    for file in latest_commit.files:

        filename = file.filename

        # ----------------------------------------------------
        # Ignore generated files
        # ----------------------------------------------------

        if should_ignore_file(filename):

            print(
                f"{filename} | "
                f"IGNORED"
            )

            continue

        print(
            f"{filename} | "
            f"Status: {file.status} | "
            f"Changes: {file.changes}"
        )

        changed_files.append(
            {
                "file": filename,
                "status": file.status,
                "changes": file.changes,
                "additions": file.additions,
                "deletions": file.deletions,
            }
        )

    # ========================================================
    # SUMMARY
    # ========================================================

    print("\nFiles detected for analysis:")

    for item in changed_files:
        print(f" - {item['file']}")

    # ========================================================
    # SAVE CURRENT CHANGES
    # ========================================================

    base_dir = os.path.dirname(
        os.path.dirname(__file__)
    )

    output_dir = os.path.join(
        base_dir,
        "data",
        "processed"
    )

    os.makedirs(
        output_dir,
        exist_ok=True
    )

    output_file = os.path.join(
        output_dir,
        "current_changes.csv"
    )

    with open(
        output_file,
        "w",
        newline="",
        encoding="utf-8"
    ) as csvfile:

        writer = csv.DictWriter(
            csvfile,
            fieldnames=[
                "file",
                "status",
                "changes",
                "additions",
                "deletions",
            ],
        )

        writer.writeheader()

        writer.writerows(
            changed_files
        )

    print(
        "\n✅ Current changed files saved to "
        f"{output_file}"
    )

    print(
        "GitHub change detection completed."
    )

    return [
    item["file"]
    for item in changed_files
    ]