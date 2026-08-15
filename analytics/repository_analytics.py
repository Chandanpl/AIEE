import pandas as pd

df = pd.read_csv("data/raw/github_dataset.csv")

print("Dataset Loaded Successfully!\n")

print("=" * 60)
print("REPOSITORY SUMMARY")
print("=" * 60)

print(f"Total Records          : {len(df)}")
print(f"Total Unique Commits   : {df['commit_id'].nunique()}")
print(f"Total Developers       : {df['author'].nunique()}")
print(f"Total Files            : {df['file_name'].nunique()}")