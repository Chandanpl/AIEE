from pyspark.sql import SparkSession
from pyspark.sql.functions import count, col, round


# ============================================================
# Create Spark Session
# ============================================================

spark = (
    SparkSession.builder
    .appName("AIEE")
    .getOrCreate()
)

print("AIEE session Successfully started!!")


# ============================================================
# Load Dataset
# ============================================================

df = spark.read.csv(
    "data/raw/github_dataset.csv",
    header=True,
    inferSchema=True,
    multiLine=True,
    escape='"',
    quote='"'
)

print("Dataset Loaded Successfully")


# ============================================================
# Show Dataset
# ============================================================

df.show(5)


# ============================================================
# Repository Statistics
# ============================================================

total_rows = df.count()

print("Total Rows:", total_rows)

print("Columns:")
print(df.columns)


# ============================================================
# File Change Analytics
# ============================================================

result = (
    df.groupBy("file_name")
    .agg(
        count("*").alias("changes")
    )
    .orderBy(
        "changes",
        ascending=False
    )
)

print("\nFile Change Analytics:")

result.show(20)


# ============================================================
# SAVE FILE ANALYTICS
# ============================================================

# Convert Spark DataFrame to Pandas
# because AIEE recommendation engine uses pandas.

file_analytics = result.toPandas()

file_analytics = file_analytics.rename(
    columns={
        "changes": "file_changes"
    }
)

file_analytics.to_csv(
    "data/processed/spark_file_analytics.csv",
    index=False
)

print(
    "\n✅ File analytics saved to "
    "data/processed/spark_file_analytics.csv"
)


# ============================================================
# Developer Activity Analytics
# ============================================================

developer_activity = (
    df.groupBy("author")
    .agg(
        count("*").alias("commit_changes")
    )
    .orderBy(
        "commit_changes",
        ascending=False
    )
)

print("\nDeveloper Activity:")

developer_activity.show(20)


# ============================================================
# Developer Contribution
# ============================================================

developer_percentage = (
    developer_activity
    .withColumn(
        "contribution_percentage",
        round(
            col("commit_changes")
            / total_rows
            * 100,
            2
        )
    )
)

print("\nDeveloper Contribution:")

developer_percentage.show(20)


# ============================================================
# Repository Statistics
# ============================================================

total_commits = (
    df.select("commit_id")
    .distinct()
    .count()
)

total_files = (
    df.select("file_name")
    .distinct()
    .count()
)

total_developers = (
    df.select("author")
    .distinct()
    .count()
)

print("\nRepository Statistics:")

print(
    "Total Commits:",
    total_commits
)

print(
    "Total Files:",
    total_files
)

print(
    "Total Developers:",
    total_developers
)


# ============================================================
# Final Message
# ============================================================

print(
    "\n✅ PySpark Analytics Completed Successfully!"
)


# ============================================================
# Stop Spark
# ============================================================

spark.stop()