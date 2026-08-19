from github import Github, Auth
import pandas as pd


# ============================================================
# Normalize GitHub Repository URL
# ============================================================

def normalize_repo_name(repo_name):

    repo_name = repo_name.strip()

    if repo_name.startswith(
        "https://github.com/"
    ):

        repo_name = repo_name.replace(
            "https://github.com/",
            "",
            1
        )

    elif repo_name.startswith(
        "http://github.com/"
    ):

        repo_name = repo_name.replace(
            "http://github.com/",
            "",
            1
        )

    if repo_name.endswith(".git"):

        repo_name = repo_name[:-4]

    repo_name = repo_name.rstrip("/")

    return repo_name


# ============================================================
# Detect Changed Files
# ============================================================

def detect_changes(
    repo_name,
    access_token
):

    # --------------------------------------------------------
    # Validate Access Token
    # --------------------------------------------------------

    if not access_token:

        raise ValueError(
            "GitHub access token is not available. "
            "Please login with GitHub again."
        )

    # --------------------------------------------------------
    # Normalize Repository
    # --------------------------------------------------------

    repo_name = normalize_repo_name(
        repo_name
    )

    print(
        "\nRepository:",
        repo_name
    )

    # --------------------------------------------------------
    # Authenticate using the currently logged-in
    # GitHub user's OAuth access token.
    # --------------------------------------------------------

    try:

        auth = Auth.Token(
            access_token
        )

        github = Github(
            auth=auth
        )

        print(
            "GitHub OAuth token accepted."
        )

    except Exception as e:

        print(
            "\n❌ GitHub authentication failed."
        )

        print(
            "Error:",
            e
        )

        raise ValueError(
            "Invalid GitHub access token."
        )

    # --------------------------------------------------------
    # Load Repository
    # --------------------------------------------------------

    try:

        repo = github.get_repo(
            repo_name
        )

        print(
            "Repository loaded successfully!"
        )

        print(
            "Repository:",
            repo.full_name
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

        raise ValueError(
            "Could not access the GitHub repository. "
            "Make sure the repository exists and "
            "the logged-in GitHub account has access."
        )

    # --------------------------------------------------------
    # Get Latest Commit
    # --------------------------------------------------------

    try:

        latest_commit = (
            repo.get_commits()[0]
        )

    except Exception as e:

        print(
            "\n❌ Could not retrieve latest commit."
        )

        print(
            "Error:",
            e
        )

        raise ValueError(
            "Could not retrieve repository commits."
        )

    print(
        "\nLatest Commit"
    )

    print(
        "=" * 60
    )

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

    # --------------------------------------------------------
    # Detect Changed Files
    # --------------------------------------------------------

    print(
        "\nChanged Files"
    )

    print(
        "=" * 60
    )

    changed_files = []

    try:

        for file in latest_commit.files:

            print(
                f"{file.filename} | "
                f"Status: {file.status} | "
                f"Changes: {file.changes}"
            )

            changed_files.append(
                file.filename
            )

    except Exception as e:

        print(
            "\n❌ Could not retrieve changed files."
        )

        print(
            "Error:",
            e
        )

        raise ValueError(
            "Could not retrieve files from "
            "the latest GitHub commit."
        )

    # --------------------------------------------------------
    # Display Files
    # --------------------------------------------------------

    print(
        "\nFiles detected for analysis:"
    )

    if not changed_files:

        print(
            "No changed files found."
        )

    else:

        for file_name in changed_files:

            print(
                " -",
                file_name
            )

    # --------------------------------------------------------
    # Save Current Changes
    # --------------------------------------------------------

    try:

        changes_df = pd.DataFrame({

            "file_name":
                changed_files

        })

        changes_df.to_csv(

            "data/processed/"
            "current_changes.csv",

            index=False

        )

        print(
            "\n✅ Current changed files saved to "
            "data/processed/current_changes.csv"
        )

    except Exception as e:

        print(
            "\n⚠️ Could not save current changes."
        )

        print(
            "Error:",
            e
        )

        # Do not stop the complete analysis just because
        # the CSV could not be written.

    # --------------------------------------------------------
    # Close GitHub Connection
    # --------------------------------------------------------

    try:

        github.close()

    except Exception:

        pass

    # --------------------------------------------------------
    # Return Changed Files
    # --------------------------------------------------------

    return changed_files


# ============================================================
# Standalone Execution
# ============================================================

if __name__ == "__main__":

    print(
        "\nAIEE GitHub Change Detector"
    )

    print(
        "=" * 60
    )

    repo_name = input(
        "Enter GitHub repository: "
    ).strip()

    print(
        "\nFor standalone execution, provide a "
        "GitHub access token."
    )

    access_token = input(
        "Enter GitHub access token: "
    ).strip()

    detect_changes(
        repo_name,
        access_token
    )