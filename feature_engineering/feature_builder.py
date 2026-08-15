import pandas as pd

# Load dataset
df = pd.read_csv("data/raw/github_dataset.csv")

print("Dataset Loaded Successfully!\n")

# -----------------------------
# Feature 1 - File Frequency
# -----------------------------

file_frequency = df["file_name"].value_counts()

df["file_frequency"] = df["file_name"].map(file_frequency)

print("Feature 1: File Frequency")
print(
    df[
        ["file_name", "file_frequency"]
    ].head()
)

# -----------------------------
# Feature 2 - Developer Activity
# -----------------------------

developer_activity = df["author"].value_counts()

df["developer_activity"] = df["author"].map(
    developer_activity
)

print("\nFeature 2: Developer Activity")
print(
    df[
        ["author", "developer_activity"]
    ].head()
)

# -----------------------------
# Feature 3 - Change Type Encoding
# -----------------------------

change_mapping = {
    "modified": 0,
    "added": 1,
    "removed": 2,
    "renamed": 3
}

df["change_type_encoded"] = df[
    "change_type"
].map(change_mapping)

print("\nFeature 3: Change Type Encoding")
print(
    df[
        ["change_type", "change_type_encoded"]
    ].head()
)

# Check for unknown change types
unknown_types = df[
    df["change_type_encoded"].isna()
]["change_type"].unique()

if len(unknown_types) > 0:
    print(
        "\n⚠️ Unknown change types found:",
        unknown_types
    )

# -----------------------------
# Feature 4 - Commit Length
# -----------------------------

df["commit_length"] = df["message"].apply(
    lambda x: len(str(x).split())
)

print("\nFeature 4: Commit Length")
print(
    df[
        ["message", "commit_length"]
    ].head()
)

# -----------------------------
# Check Feature Dataset
# -----------------------------

print("\nFeature Dataset Preview:")
print(
    df[
        [
            "file_name",
            "file_frequency",
            "developer_activity",
            "change_type_encoded",
            "commit_length"
        ]
    ].head()
)

# -----------------------------
# Save Feature Dataset
# -----------------------------

df.to_csv(
    "data/processed/feature_dataset.csv",
    index=False
)

print(
    "\n✅ Feature dataset created successfully!"
)