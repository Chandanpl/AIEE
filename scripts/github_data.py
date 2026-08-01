from github import Github

# Your GitHub Token
import os

TOKEN = os.getenv("GITHUB_TOKEN")


github = Github(TOKEN)

repo = github.get_repo("fastapi/fastapi")

print("Repository :", repo.name)
print("-" * 60)

commits = repo.get_commits()

count = 0

for commit in commits:

    print("=" * 70)

    print("Commit ID :", commit.sha)

    print("Author :", commit.commit.author.name)

    print("Message :", commit.commit.message)

    print("\nFiles Changed:")

    files = commit.files

    for file in files:

        print("   -", file.filename)

    count += 1

    if count == 5:
        break