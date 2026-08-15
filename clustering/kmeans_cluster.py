import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# -----------------------------------
# Load Feature Dataset
# -----------------------------------

df = pd.read_csv(
    "data/processed/feature_dataset.csv"
)

print("Dataset Loaded Successfully!")

# -----------------------------------
# Aggregate Features by File
# -----------------------------------

file_features = df.groupby("file_name").agg({
    "file_frequency": "max",
    "developer_activity": "max",
    "change_type_encoded": "mean",
    "commit_length": "mean"
}).reset_index()

print("\nFile-level Features:")
print(file_features.head())

# -----------------------------------
# Select Features
# -----------------------------------

features = file_features[
    [
        "file_frequency",
        "developer_activity",
        "change_type_encoded",
        "commit_length"
    ]
]

print("\nFeatures Selected")

# -----------------------------------
# Scale Features
# -----------------------------------

scaler = StandardScaler()

scaled_features = scaler.fit_transform(
    features
)

print("Features Scaled")

# -----------------------------------
# Train KMeans
# -----------------------------------

kmeans = KMeans(
    n_clusters=3,
    random_state=42,
    n_init=10
)

file_features["cluster"] = (
    kmeans.fit_predict(scaled_features)
)

# -----------------------------------
# Display Results
# -----------------------------------

print("\nResult of Cluster")

print(
    file_features[
        ["file_name", "cluster"]
    ]
)

# -----------------------------------
# Save Results
# -----------------------------------

file_features.to_csv(
    "data/processed/kmeans_cluster.csv",
    index=False
)

print("\nDone 😍")