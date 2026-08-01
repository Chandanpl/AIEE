from git import Repo
import pandas as pd

# Path of the cloned repository
REPO_PATH = "repositories/fastapi"

# Open the repository
repo = Repo(REPO_PATH)
dataset=[]

print("Repository Loaded Successfully!")
print("\nLatest 5 Commits\n")

for commit in repo.iter_commits(max_count=5):

    print("=" * 60)

    print("Commit ID :", commit.hexsha)

    print("Author :", commit.author.name)

    print("Date :", commit.committed_datetime)

    print("Message :", commit.message)
print("\nReading Changed Files...\n")

for commit in repo.iter_commits(max_count=3):

    print("=" * 70)

    print("Commit :", commit.hexsha)

    if len(commit.parents) == 0:
        print("Initial Commit - Skipping")
        continue

    parent = commit.parents[0]

    diff = parent.diff(commit)

    for file in diff:

        dataset.append({

            "commit_id": commit.hexsha,

            "author": commit.author.name,

            "date": commit.committed_datetime,

        "message": commit.message.strip(),

        "file_name": file.a_path,

        "change_type": file.change_type

    })
df = pd.DataFrame(dataset)

df.to_csv(
    "data/raw/github_dataset.csv",
    index=False
)

print("\n✅ Dataset Created Successfully!")

print(df.head())
