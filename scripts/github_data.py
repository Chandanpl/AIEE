from github import Github, Auth
import os
import pandas as pd

# -----------------------------------
# GitHub Authentication
# -----------------------------------

TOKEN = os.getenv("GITHUB_TOKEN")

if not TOKEN:
    raise ValueError("GITHUB_TOKEN is not set!")

auth = Auth.Token(TOKEN)
github = Github(auth=auth)

# -----------------------------------
# Repository Input
# -----------------------------------

repo_name = input(
    "Enter GitHub repository: "
).strip()

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

repo_name = repo_name.rstrip("/")

# -----------------------------------
# Load Repository
# -----------------------------------

try:
    repo = github.get_repo(repo_name)

    print("\nRepository:", repo.full_name)
    print("Repository Loaded Successfully!")
    print("-" * 60)

except Exception as e:
    print("\n❌ Could not load repository.")
    print("Repository:", repo_name)
    print("Error:", e)
    exit()

# -----------------------------------
# Collect Commits
# -----------------------------------

commits = repo.get_commits()

data = []

count = 0

for commit in commits:

    print(f"Processing commit {count + 1}...")

    for file in commit.files:

        data.append({
            "commit_id": commit.sha,
            "author": commit.commit.author.name,
            "date": commit.commit.author.date,
            "message": commit.commit.message,
            "file_name": file.filename,
            "change_type": file.status
        })

    count += 1

    if count == 500:
        break

# -----------------------------------
# Create Dataset
# -----------------------------------

df = pd.DataFrame(data)

print("\nDataset Created Successfully!")

print("Total Rows:", len(df))

print(
    "Total Commits:",
    df["commit_id"].nunique()
)

print(
    "Total Files:",
    df["file_name"].nunique()
)

print("\nFirst 5 Rows:")
print(df.head())

# -----------------------------------
# Save Dataset
# -----------------------------------

df.to_csv(
    "data/raw/github_dataset.csv",
    index=False
)

print(
    "\n✅ Dataset saved to "
    "data/raw/github_dataset.csv"
)