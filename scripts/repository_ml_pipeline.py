import os
import pandas as pd

from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

PROCESSED_DIR = os.path.join(
    BASE_DIR,
    "data",
    "processed"
)


# ============================================================
# INPUT FILES
# ============================================================

DEPENDENCY_FILE = os.path.join(
    PROCESSED_DIR,
    "file_dependency.csv"
)

FREQUENCY_FILE = os.path.join(
    PROCESSED_DIR,
    "file_change_frequency.csv"
)


# ============================================================
# OUTPUT FILES
# ============================================================

FEATURE_FILE = os.path.join(
    PROCESSED_DIR,
    "feature_dataset.csv"
)

KMEANS_FILE = os.path.join(
    PROCESSED_DIR,
    "kmeans_cluster.csv"
)

DBSCAN_FILE = os.path.join(
    PROCESSED_DIR,
    "dbscan_clustered.csv"
)

SPARK_FILE = os.path.join(
    PROCESSED_DIR,
    "spark_file_analytics.csv"
)


# ============================================================
# LOAD INPUT DATA
# ============================================================

def load_repository_data():

    print("\nLoading repository-specific datasets...")

    if not os.path.exists(DEPENDENCY_FILE):

        raise FileNotFoundError(
            "file_dependency.csv was not found."
        )

    if not os.path.exists(FREQUENCY_FILE):

        raise FileNotFoundError(
            "file_change_frequency.csv was not found."
        )

    dependency_df = pd.read_csv(
        DEPENDENCY_FILE
    )

    frequency_df = pd.read_csv(
        FREQUENCY_FILE
    )

    print(
        "Dependency relationships:",
        len(dependency_df)
    )

    print(
        "File frequency records:",
        len(frequency_df)
    )

    return (
        dependency_df,
        frequency_df,
    )


# ============================================================
# BUILD FILE FEATURES
# ============================================================

def build_feature_dataset(
    dependency_df,
    frequency_df,
):

    print("\nBuilding file-level feature dataset...")

    # --------------------------------------------------------
    # Collect every file appearing in the repository history
    # --------------------------------------------------------

    files = set()

    files.update(
        dependency_df["file_a"]
        .dropna()
        .astype(str)
        .tolist()
    )

    files.update(
        dependency_df["file_b"]
        .dropna()
        .astype(str)
        .tolist()
    )

    files.update(
        frequency_df["file"]
        .dropna()
        .astype(str)
        .tolist()
    )

    files = sorted(files)

    # --------------------------------------------------------
    # Frequency lookup
    # --------------------------------------------------------

    frequency_lookup = dict(
        zip(
            frequency_df["file"],
            frequency_df["change_frequency"]
        )
    )

    # --------------------------------------------------------
    # Dependency statistics
    # --------------------------------------------------------

    dependency_count = {}
    total_cochange_count = {}

    for file_name in files:

        rows_a = dependency_df[
            dependency_df["file_a"]
            == file_name
        ]

        rows_b = dependency_df[
            dependency_df["file_b"]
            == file_name
        ]

        dependency_count[file_name] = (
            len(rows_a)
            +
            len(rows_b)
        )

        total_cochange_count[file_name] = (
            rows_a["count"].sum()
            +
            rows_b["count"].sum()
        )

    # --------------------------------------------------------
    # Build records
    # --------------------------------------------------------

    records = []

    for file_name in files:

        change_frequency = int(
            frequency_lookup.get(
                file_name,
                0
            )
        )

        dependencies = int(
            dependency_count.get(
                file_name,
                0
            )
        )

        cochange_count = int(
            total_cochange_count.get(
                file_name,
                0
            )
        )

        records.append({

            "file_name":
                file_name,

            "change_frequency":
                change_frequency,

            "dependency_count":
                dependencies,

            "cochange_count":
                cochange_count,
        })

    feature_df = pd.DataFrame(
        records
    )

    # --------------------------------------------------------
    # Save feature dataset
    # --------------------------------------------------------

    feature_df.to_csv(
        FEATURE_FILE,
        index=False
    )

    print(
        "Feature dataset saved:",
        FEATURE_FILE
    )

    print(
        "Total files:",
        len(feature_df)
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

    # --------------------------------------------------------
    # Handle very small repositories
    # --------------------------------------------------------

    if len(df) < 2:

        df["cluster"] = 0

        df.to_csv(
            KMEANS_FILE,
            index=False
        )

        print(
            "Repository is too small for normal "
            "KMeans clustering."
        )

        print(
            "KMeans dataset saved:",
            KMEANS_FILE
        )

        return df

    # --------------------------------------------------------
    # Scale features
    # --------------------------------------------------------

    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(X)

    # --------------------------------------------------------
    # Select number of clusters
    # --------------------------------------------------------

    n_clusters = min(
        3,
        len(df)
    )

    model = KMeans(
        n_clusters=n_clusters,
        random_state=42,
        n_init=10
    )

    df["cluster"] = model.fit_predict(
        X_scaled
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    df.to_csv(
        KMEANS_FILE,
        index=False
    )

    print(
        "KMeans clusters:",
        n_clusters
    )

    print(
        "KMeans dataset saved:",
        KMEANS_FILE
    )

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

    # --------------------------------------------------------
    # Handle very small repositories
    # --------------------------------------------------------

    if len(df) < 3:

        df["cluster"] = -1

        df.to_csv(
            DBSCAN_FILE,
            index=False
        )

        print(
            "Repository is too small for DBSCAN."
        )

        print(
            "DBSCAN dataset saved:",
            DBSCAN_FILE
        )

        return df

    # --------------------------------------------------------
    # Scale
    # --------------------------------------------------------

    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(X)

    # --------------------------------------------------------
    # DBSCAN
    # --------------------------------------------------------

    model = DBSCAN(
        eps=0.8,
        min_samples=2
    )

    df["cluster"] = model.fit_predict(
        X_scaled
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    df.to_csv(
        DBSCAN_FILE,
        index=False
    )

    print(
        "DBSCAN clusters generated."
    )

    print(
        "DBSCAN dataset saved:",
        DBSCAN_FILE
    )

    return df


# ============================================================
# SPARK-STYLE FILE ANALYTICS
# ============================================================

def build_file_analytics(feature_df):

    print(
        "\nBuilding file analytics dataset..."
    )

    analytics_df = feature_df[
        [
            "file_name",
            "change_frequency",
            "dependency_count",
            "cochange_count",
        ]
    ].copy()

    # --------------------------------------------------------
    # Rename frequency column to match the existing AIEE
    # scoring code.
    # --------------------------------------------------------

    analytics_df = analytics_df.rename(
        columns={
            "change_frequency":
                "file_changes"
        }
    )

    analytics_df.to_csv(
        SPARK_FILE,
        index=False
    )

    print(
        "File analytics dataset saved:",
        SPARK_FILE
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

    kmeans_df = run_kmeans(
        feature_df
    )

    dbscan_df = run_dbscan(
        feature_df
    )

    spark_df = build_file_analytics(
        feature_df
    )

    print("\n" + "=" * 70)
    print("REPOSITORY ML PIPELINE COMPLETED")
    print("=" * 70)

    print(
        "\nFiles generated:"
    )

    print(
        "1.",
        FEATURE_FILE
    )

    print(
        "2.",
        KMEANS_FILE
    )

    print(
        "3.",
        DBSCAN_FILE
    )

    print(
        "4.",
        SPARK_FILE
    )

    return {
        "feature_dataset":
            FEATURE_FILE,

        "kmeans_cluster":
            KMEANS_FILE,

        "dbscan_cluster":
            DBSCAN_FILE,

        "spark_analytics":
            SPARK_FILE,

        "total_files":
            len(feature_df),
    }


# ============================================================
# DIRECT EXECUTION
# ============================================================

if __name__ == "__main__":

    run_repository_ml_pipeline()