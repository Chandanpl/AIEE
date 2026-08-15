import pandas as pd
from itertools import combinations

# Load dataset
df = pd.read_csv("data/raw/github_dataset.csv")

# Group files by commit
commit_groups = df.groupby("commit_id")["file_name"].apply(list)

dependency_count = {}

for files in commit_groups:

    # Remove duplicate files in same commit
    files = list(set(files))

    # Create every possible pair
    for pair in combinations(sorted(files), 2):

        dependency_count[pair] = dependency_count.get(pair, 0) + 1

dependency_df = pd.DataFrame(
    [
        {
            "file_a": pair[0],
            "file_b": pair[1],
            "count": count
        }
        for pair, count in dependency_count.items()
    ]
)

dependency_df = dependency_df.sort_values(
    by="count",
    ascending=False
)

print(dependency_df.head(20))
# Save the dependency dataset
dependency_df.to_csv(
    "data/processed/file_dependency.csv",
    index=False
)

print("\n Dependency dataset saved successfully!")