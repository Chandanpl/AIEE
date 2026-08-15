import pandas as pd
import hdbscan
from sklearn.preprocessing import StandardScaler
df=pd.read_csv('data/processed/feature_dataset.csv ')
features = df[
    [
        "file_frequency",
        "developer_activity",
        "change_type_encoded",
        "commit_length"
    ]
]
scaler=StandardScaler()
scaled_features=scaler.fit_transform(features)
cluster=hdbscan.HDBSCAN(
    min_cluster_size=3
)
df['cluster']=cluster.fit_predict(scaled_features)
print("\nHdbscan clustering results\n")
print(df[
    'file_name','cluster'
].head(20))
df.to_save(
    'data/processed/hdbscan_clustered.csv',
    index=False
)
print('\n done👌')