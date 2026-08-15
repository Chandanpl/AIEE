from pyspark.sql import SparkSession
from pyspark.sql.functions import count

spark = SparkSession.builder \
    .appName("AIEE Analytics Export") \
    .getOrCreate()

print("✅ Spark Session Started")

# Load GitHub dataset
df = spark.read.csv(
    "data/raw/github_dataset.csv",
    header=True,
    inferSchema=True,
    multiLine=True,
    escape='"',
    quote='"'
)

print("✅ Dataset Loaded")

# File-level analytics
file_analytics = df.groupBy("file_name") \
    .agg(count("*").alias("file_changes")) \
    .orderBy("file_changes", ascending=False)

print("\nFile Analytics:")
file_analytics.show(20)

# Convert Spark DataFrame to Pandas
result = file_analytics.toPandas()

# Save using Pandas
result.to_csv(
    "data/processed/spark_file_analytics.csv",
    index=False
)

print("\n✅ PySpark analytics exported successfully!")

spark.stop()