from github import Github, Auth
import os
import pandas as pd


# -----------------------------------
# GitHub Authentication
# -----------------------------------

TOKEN = os.getenv("GITHUB_TOKEN")

if not TOKEN:
    raise ValueError(
        "GITHUB_TOKEN is not set!"
    )

auth = Auth.Token(TOKEN)
github = Github(auth=auth)


# -----------------------------------
# Detect Changed Files
# -----------------------------------

def detect_changes(repo_name):

    # Accept full GitHub URL

    if repo_name.startswith("https://github.com/"):
        repo_name = repo_name.replace(
            "https://github.com/",
            "",
            1
        )

    # Remove .git

    if repo_name.endswith(".git"):
        repo_name = repo_name[:-4]

    # Remove trailing /

    repo_name = repo_name.rstrip("/")

    print("\nRepository:", repo_name)

    # -----------------------------------
    # Load Repository
    # -----------------------------------

    try:

        repo = github.get_repo(repo_name)

        print(
            "Repository loaded successfully!"
        )

    except Exception as e:

        print(
            "\n❌ Could not load repository."
        )

        print(
            "Repository:",
            repo_name
        )

        print(
            "Error:",
            e
        )

        return []


    # -----------------------------------
    # Latest Commit
    # -----------------------------------

    latest_commit = repo.get_commits()[0]

    print("\nLatest Commit")
    print("=" * 60)

    print(
        "Commit ID :",
        latest_commit.sha
    )

    print(
        "Author    :",
        latest_commit.commit.author.name
    )

    print(
        "Message   :",
        latest_commit.commit.message
    )


    # -----------------------------------
    # Changed Files
    # -----------------------------------

    print("\nChanged Files")
    print("=" * 60)

    changed_files = []

    for file in latest_commit.files:

        print(
            f"{file.filename} | "
            f"Status: {file.status} | "
            f"Changes: {file.changes}"
        )

        changed_files.append(
            file.filename
        )


    # -----------------------------------
    # Display Files
    # -----------------------------------

    print(
        "\nFiles detected for analysis:"
    )

    for file_name in changed_files:

        print(
            " -",
            file_name
        )


    # -----------------------------------
    # Save Current Changes
    # -----------------------------------

    changes_df = pd.DataFrame({
        "file_name": changed_files
    })

    changes_df.to_csv(
        "data/processed/current_changes.csv",
        index=False
    )

    print(
        "\n✅ Current changed files saved to "
        "data/processed/current_changes.csv"
    )

    return changed_files


# -----------------------------------
# Standalone Execution
# -----------------------------------

if __name__ == "__main__":

    repo_name = input(
        "Enter GitHub repository: "
    ).strip()

    detect_changes(repo_name)