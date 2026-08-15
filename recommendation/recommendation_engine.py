import pandas as pd

# Load dependency dataset
df = pd.read_csv("data/processed/file_dependency.csv")

print("Dependency Dataset Loaded Successfully!")

print(df.head())
def recommend_files(file_name, top_n=5):

    recommendations = df[
        (df["file_a"] == file_name) |
        (df["file_b"] == file_name)
    ].copy()

    recommendations = recommendations.sort_values(
        by="count",
        ascending=False
    )

    return recommendations.head(top_n)
file_name = input("Enter file name: ").strip()

result = recommend_files(file_name)

if result.empty:
    print("\n No recommendations found.")
else:
    print("\nTop Recommended Files:\n")

    for _, row in result.iterrows():

        if row["file_a"] == file_name:
            recommended = row["file_b"]
        else:
            recommended = row["file_a"]

        print(f"➡ {recommended}   (Score: {row['count']})")