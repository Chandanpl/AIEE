import pandas as pd

# -----------------------------------
# Load datasets
# -----------------------------------

dbscan_df = pd.read_csv(
    "data/processed/dbscan_clustered.csv"
)

kmeans_df = pd.read_csv(
    "data/processed/kmeans_cluster.csv"
)

dependency_df = pd.read_csv(
    "data/processed/file_dependency.csv"
)

spark_df = pd.read_csv(
    "data/processed/spark_file_analytics.csv"
)

current_changes_df = pd.read_csv(
    "data/processed/current_changes.csv"
)

print("All datasets loaded successfully!")

# -----------------------------------
# Find related files
# -----------------------------------

def recommend(file_name):

    related = dependency_df[
        (dependency_df["file_a"] == file_name) |
        (dependency_df["file_b"] == file_name)
    ].copy()

    return related.sort_values(
        by="count",
        ascending=False
    )


# -----------------------------------
# Get KMeans cluster
# -----------------------------------

def get_kmeans_cluster(file_name):

    row = kmeans_df[
        kmeans_df["file_name"] == file_name
    ]

    if row.empty:
        return None

    return row.iloc[0]["cluster"]


# -----------------------------------
# Get DBSCAN cluster
# -----------------------------------

def get_dbscan_cluster(file_name):

    row = dbscan_df[
        dbscan_df["file_name"] == file_name
    ]

    if row.empty:
        return None

    return row.iloc[0]["cluster"]


# -----------------------------------
# Get PySpark file frequency
# -----------------------------------

def get_file_frequency(file_name):

    row = spark_df[
        spark_df["file_name"] == file_name
    ]

    if row.empty:
        return 0

    return int(
        row.iloc[0]["file_changes"]
    )


# -----------------------------------
# Hybrid Recommendation
# -----------------------------------

def hybrid_recommend(file_name):

    recommendations = recommend(file_name)

    if recommendations.empty:

        print(
            f"\nNo recommendations found for: "
            f"{file_name}"
        )

        return

    print(
        f"\nRecommendations for: "
        f"{file_name}\n"
    )

    current_kmeans = get_kmeans_cluster(
        file_name
    )

    current_dbscan = get_dbscan_cluster(
        file_name
    )

    print(
        f"KMeans Cluster: {current_kmeans}"
    )

    print(
        f"DBSCAN Cluster: {current_dbscan}"
    )

    print("\nPotentially affected files:")
    print("-" * 80)

    for _, row in recommendations.iterrows():

        # -----------------------------------
        # Find the other file
        # -----------------------------------

        if row["file_a"] == file_name:

            recommended_file = row["file_b"]

        else:

            recommended_file = row["file_a"]

        # -----------------------------------
        # Get clusters
        # -----------------------------------

        recommended_kmeans = (
            get_kmeans_cluster(
                recommended_file
            )
        )

        recommended_dbscan = (
            get_dbscan_cluster(
                recommended_file
            )
        )

        # -----------------------------------
        # Compare KMeans clusters
        # -----------------------------------

        same_kmeans = (
            current_kmeans is not None
            and recommended_kmeans is not None
            and current_kmeans
            == recommended_kmeans
        )

        # -----------------------------------
        # Compare DBSCAN clusters
        # -----------------------------------

        same_dbscan = (
            current_dbscan is not None
            and recommended_dbscan is not None
            and current_dbscan
            == recommended_dbscan
        )

        # -----------------------------------
        # Get file frequency
        # -----------------------------------

        file_frequency = get_file_frequency(
            recommended_file
        )

        # -----------------------------------
        # Calculate final score
        # -----------------------------------

        final_score = (
            row["count"]
            + file_frequency
        )

        # Same KMeans cluster
        if same_kmeans:
            final_score += 5

        # Same DBSCAN cluster
        if same_dbscan:
            final_score += 3

        # DBSCAN outlier
        if recommended_dbscan == -1:
            final_score += 2

        # -----------------------------------
        # Display result
        # -----------------------------------

        print(
            f"{recommended_file} | "
            f"Dependency: {row['count']} | "
            f"Frequency: {file_frequency} | "
            f"KMeans: {recommended_kmeans} | "
            f"DBSCAN: {recommended_dbscan} | "
            f"Final Score: {final_score}"
        )


# -----------------------------------
# Automatic Changed Files
# -----------------------------------

if current_changes_df.empty:

    print(
        "\nNo changed files detected."
    )

else:

    print(
        "\nFiles detected for analysis:"
    )

    for file_name in current_changes_df[
        "file_name"
    ]:

        print(
            f"\n{'=' * 80}"
        )

        print(
            f"Analyzing changed file: "
            f"{file_name}"
        )

        print(
            f"{'=' * 80}"
        )

        hybrid_recommend(file_name)