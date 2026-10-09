
import os
import pandas as pd

from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

PROCESSED_DIR = os.path.join(
    BASE_DIR, "data", "processed"
)

os.makedirs(PROCESSED_DIR, exist_ok=True)


# ============================================================
# INPUT FILES
# ============================================================

DEPENDENCY_FILE = os.path.join(
    PROCESSED_DIR, "file_dependency.csv"
)

FREQUENCY_FILE = os.path.join(
    PROCESSED_DIR, "file_change_frequency.csv"
)


# ============================================================
# OUTPUT FILES
# ============================================================

FEATURE_FILE = os.path.join(
    PROCESSED_DIR, "feature_dataset.csv"
)

KMEANS_FILE = os.path.join(
    PROCESSED_DIR, "kmeans_cluster.csv"
)

DBSCAN_FILE = os.path.join(
    PROCESSED_DIR, "dbscan_clustered.csv"
)

SPARK_FILE = os.path.join(
    PROCESSED_DIR, "spark_file_analytics.csv"
)


# ============================================================
# LOAD INPUT DATA
# ============================================================

def load_repository_data():

    print("\nLoading repository-specific datasets...")

    if not os.path.exists(DEPENDENCY_FILE):
        raise FileNotFoundError(
            f"Dependency file not found: {DEPENDENCY_FILE}"
        )

    if not os.path.exists(FREQUENCY_FILE):
        raise FileNotFoundError(
            f"Frequency file not found: {FREQUENCY_FILE}"
        )

    dependency_df = pd.read_csv(DEPENDENCY_FILE)

    frequency_df = pd.read_csv(FREQUENCY_FILE)

    required_dependency = {
        "file_a", "file_b", "count"
    }

    required_frequency = {
        "file", "change_frequency"
    }

    if not required_dependency.issubset(
        dependency_df.columns
    ):
        raise ValueError(
            "file_dependency.csv must contain "
            "file_a, file_b, and count."
        )

    if not required_frequency.issubset(
        frequency_df.columns
    ):
        raise ValueError(
            "file_change_frequency.csv must contain "
            "file and change_frequency."
        )

    print(
        "Dependency relationships:",
        len(dependency_df)
    )

    print(
        "File frequency records:",
        len(frequency_df)
    )

    return dependency_df, frequency_df


# ============================================================
# BUILD FILE FEATURES - OPTIMIZED
# ============================================================

def build_feature_dataset(
    dependency_df,
    frequency_df,
):

    print(
        "\nBuilding optimized file-level feature dataset..."
    )

    # --------------------------------------------------------
    # Prepare dependency data
    # --------------------------------------------------------

    dep = dependency_df[
        ["file_a", "file_b", "count"]
    ].copy()

    dep["file_a"] = dep["file_a"].astype("string")
    dep["file_b"] = dep["file_b"].astype("string")

    dep["count"] = pd.to_numeric(
        dep["count"],
        errors="coerce",
    ).fillna(0)

    # --------------------------------------------------------
    # Aggregate dependencies by file_a
    # --------------------------------------------------------

    stats_a = (
        dep.dropna(subset=["file_a"])
        .groupby("file_a", sort=False)
        .agg(
            dependency_count=("file_b", "size"),
            cochange_count=("count", "sum"),
        )
    )

    stats_a.index.name = "file_name"

    # --------------------------------------------------------
    # Aggregate dependencies by file_b
    # --------------------------------------------------------

    stats_b = (
        dep.dropna(subset=["file_b"])
        .groupby("file_b", sort=False)
        .agg(
            dependency_count=("file_a", "size"),
            cochange_count=("count", "sum"),
        )
    )

    stats_b.index.name = "file_name"

    # --------------------------------------------------------
    # Combine statistics in one operation
    # --------------------------------------------------------

    dependency_stats = (
        pd.concat([stats_a, stats_b])
        .groupby(level=0, sort=False)
        .sum()
    )

    del stats_a, stats_b, dep

    print(
        "Unique files with dependency statistics:",
        len(dependency_stats),
    )

    # --------------------------------------------------------
    # Prepare frequency lookup
    # Preserve the last value if a file occurs more than once.
    # --------------------------------------------------------

    freq = frequency_df[
        ["file", "change_frequency"]
    ].copy()

    freq = freq.dropna(subset=["file"])

    freq["file"] = freq["file"].astype(str)

    freq["change_frequency"] = pd.to_numeric(
        freq["change_frequency"],
        errors="coerce",
    ).fillna(0)

    frequency_lookup = (
        freq.drop_duplicates(
            subset=["file"],
            keep="last",
        )
        .set_index("file")["change_frequency"]
    )

    # --------------------------------------------------------
    # Collect all files
    # --------------------------------------------------------

    all_files = set(dependency_stats.index)
    all_files.update(frequency_lookup.index)

    feature_df = pd.DataFrame({
        "file_name": sorted(all_files)
    })

    # --------------------------------------------------------
    # Map precomputed statistics
    # No repeated full-DataFrame filtering.
    # --------------------------------------------------------

    feature_df["change_frequency"] = (
        feature_df["file_name"]
        .map(frequency_lookup)
        .fillna(0)
    )

    feature_df["dependency_count"] = (
        feature_df["file_name"]
        .map(dependency_stats["dependency_count"])
        .fillna(0)
    )

    feature_df["cochange_count"] = (
        feature_df["file_name"]
        .map(dependency_stats["cochange_count"])
        .fillna(0)
    )

    feature_df["change_frequency"] = (
        feature_df["change_frequency"].round().astype(int)
    )

    feature_df["dependency_count"] = (
        feature_df["dependency_count"].astype(int)
    )

    feature_df["cochange_count"] = (
        feature_df["cochange_count"].round().astype(int)
    )

    # --------------------------------------------------------
    # Save feature dataset
    # --------------------------------------------------------

    feature_df.to_csv(
        FEATURE_FILE,
        index=False,
    )

    print(
        "Feature dataset saved:",
        FEATURE_FILE,
    )

    print(
        "Total files:",
        len(feature_df),
    )

    return feature_df


# ============================================================
# KMEANS CLUSTERING
# ============================================================

def run_kmeans(feature_df):

    print("\nRunning KMeans clustering...")

    df = feature_df.copy()

    feature_columns = [
        "change_frequency",
        "dependency_count",
        "cochange_count",
    ]

    X = df[feature_columns].fillna(0)

    # Handle empty and very small repositories.
    if len(df) == 0:
        df["cluster"] = pd.Series(dtype=int)

        df.to_csv(KMEANS_FILE, index=False)

        print("No files available for KMeans.")

        return df

    if len(df) < 2:
        df["cluster"] = 0

        df.to_csv(KMEANS_FILE, index=False)

        print("Repository is too small for KMeans.")

        return df

    # Scale features.
    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(X)

    # Select cluster count.
    n_clusters = min(3, len(df))

    model = KMeans(
        n_clusters=n_clusters,
        random_state=42,
        n_init=10,
    )

    df["cluster"] = model.fit_predict(X_scaled)

    df.to_csv(
        KMEANS_FILE,
        index=False,
    )

    print("KMeans clusters:", n_clusters)
    print("KMeans dataset saved:", KMEANS_FILE)

    return df


# ============================================================
# DBSCAN CLUSTERING
# ============================================================

def run_dbscan(feature_df):

    print("\nRunning DBSCAN clustering...")

    df = feature_df.copy()

    feature_columns = [
        "change_frequency",
        "dependency_count",
        "cochange_count",
    ]

    X = df[feature_columns].fillna(0)

    # Handle empty and small repositories.
    if len(df) == 0:
        df["cluster"] = pd.Series(dtype=int)

        df.to_csv(DBSCAN_FILE, index=False)

        print("No files available for DBSCAN.")

        return df

    if len(df) < 3:
        df["cluster"] = -1

        df.to_csv(DBSCAN_FILE, index=False)

        print("Repository is too small for DBSCAN.")

        return df

    # Scale features.
    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(X)

    # DBSCAN clustering.
    model = DBSCAN(
        eps=0.8,
        min_samples=2,
    )

    df["cluster"] = model.fit_predict(X_scaled)

    df.to_csv(
        DBSCAN_FILE,
        index=False,
    )

    print("DBSCAN clusters generated.")
    print("DBSCAN dataset saved:", DBSCAN_FILE)

    return df


# ============================================================
# SPARK-STYLE FILE ANALYTICS
# ============================================================

def build_file_analytics(feature_df):

    print("\nBuilding file analytics dataset...")

    analytics_df = feature_df[
        [
            "file_name",
            "change_frequency",
            "dependency_count",
            "cochange_count",
        ]
    ].copy()

    analytics_df = analytics_df.rename(
        columns={
            "change_frequency": "file_changes"
        }
    )

    analytics_df.to_csv(
        SPARK_FILE,
        index=False,
    )

    print(
        "File analytics dataset saved:",
        SPARK_FILE,
    )

    return analytics_df


# ============================================================
# COMPLETE PIPELINE
# ============================================================

def run_repository_ml_pipeline():

    print("\n" + "=" * 70)
    print("AIEE REPOSITORY ML PIPELINE")
    print("=" * 70)

    dependency_df, frequency_df = (
        load_repository_data()
    )

    feature_df = build_feature_dataset(
        dependency_df,
        frequency_df,
    )

    # Release the large input DataFrames before clustering.
    del dependency_df, frequency_df

    kmeans_df = run_kmeans(feature_df)

    dbscan_df = run_dbscan(feature_df)

    spark_df = build_file_analytics(feature_df)

    print("\n" + "=" * 70)
    print("REPOSITORY ML PIPELINE COMPLETED")
    print("=" * 70)

    print("\nFiles generated:")

    print("1.", FEATURE_FILE)
    print("2.", KMEANS_FILE)
    print("3.", DBSCAN_FILE)
    print("4.", SPARK_FILE)

    return {
        "feature_dataset": FEATURE_FILE,
        "kmeans_cluster": KMEANS_FILE,
        "dbscan_cluster": DBSCAN_FILE,
        "spark_analytics": SPARK_FILE,
        "total_files": len(feature_df),
    }


# ============================================================
# DIRECT EXECUTION
# ============================================================

if __name__ == "__main__":

    run_repository_ml_pipeline()
