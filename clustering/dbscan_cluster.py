import pandas as pd
from sklearn.cluster import DBSCAN
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
# Train DBSCAN
# -----------------------------------

dbscan = DBSCAN(
    eps=1.2,
    min_samples=3
)

file_features["cluster"] = (
    dbscan.fit_predict(scaled_features)
)

# -----------------------------------
# Display Results
# -----------------------------------

print("\nDBSCAN Results\n")

print(
    file_features[
        ["file_name", "cluster"]
    ]
)

# -----------------------------------
# Save Results
# -----------------------------------

file_features.to_csv(
    "data/processed/dbscan_clustered.csv",
    index=False
)

print(
    "\n✅ DBSCAN clustering completed successfully!"
)