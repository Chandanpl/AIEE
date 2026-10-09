import os
import uvicorn
import pandas as pd

from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from app.github_auth import router as github_auth_router
from app.database import SessionLocal
from app.models_db import Session as DBSession

from scripts.change_detector import detect_changes
from scripts.repository_history import detect_repository_history
from scripts.repository_ml_pipeline import run_repository_ml_pipeline


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="AI-Evolution-Engine",
    description=(
        "An evolution engine for modular AI applications, "
        "handling prediction, recommendation, clustering, "
        "dependency analysis, and data pipelines."
    ),
    version="0.1.0",
)

app.include_router(github_auth_router)


# ============================================================
# CORS Middleware
# ============================================================

allowed_origins = [
    "https://aiee-1-ymwf.onrender.com",
    "http://localhost:30080",
    "http://127.0.0.1:30080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")

if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Authentication Helper
# ============================================================

def get_authenticated_session(request: Request):
    """
    Authenticate using either:
    1. The HttpOnly aiee_session cookie.
    2. Authorization: Bearer <AIEE session ID>.

    The Bearer token must be an AIEE session ID stored in the
    database, not a GitHub OAuth access token.
    """

    session_id = request.cookies.get("aiee_session")

    authorization = request.headers.get("Authorization", "")
    scheme, _, credentials = authorization.partition(" ")

    if scheme.lower() == "bearer" and credentials.strip():
        session_id = credentials.strip()

    if not session_id:
        return None, None

    db = SessionLocal()

    try:
        session = db.get(DBSession, session_id)

        if session is None:
            db.close()
            return None, None

        if session.expires_at is not None:
            now = datetime.now(timezone.utc)
            expires_at = session.expires_at

            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(
                    tzinfo=timezone.utc
                )

            if expires_at <= now:
                db.delete(session)
                db.commit()
                db.close()
                return None, None

        return db, session

    except Exception:
        db.close()
        raise


# ============================================================
# Root Endpoint
# ============================================================

@app.get("/")
async def root():
    return {
        "message": "Welcome to the AI-Evolution-Engine API",
        "status": "healthy",
        "docs_url": "/docs",
    }


# ============================================================
# Health Endpoint
# ============================================================

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "AI-Evolution-Engine",
    }


# ============================================================
# Authentication Status
# ============================================================

@app.get("/auth/status")
async def auth_status(request: Request):

    print("\n" + "=" * 60)
    print("AIEE AUTH STATUS")
    print("=" * 60)

    print("Request origin:", request.headers.get("origin"))
    print("Request host:", request.headers.get("host"))

    cookie_session_id = request.cookies.get("aiee_session")

    authorization = request.headers.get("Authorization", "")
    scheme, _, bearer_value = authorization.partition(" ")

    bearer_session_present = (
        scheme.lower() == "bearer"
        and bool(bearer_value.strip())
    )

    print("Cookie received:", bool(cookie_session_id))
    print("Bearer session received:", bearer_session_present)

    if not cookie_session_id and not bearer_session_present:
        return {
            "authenticated": False,
            "message": "User is not logged in with GitHub.",
        }

    db = None

    try:
        db, session = get_authenticated_session(request)

        if not session:
            return {
                "authenticated": False,
                "message": "GitHub session is invalid or expired.",
            }

        user = session.user

        if not user:
            return {
                "authenticated": False,
                "message": "Associated GitHub user was not found.",
            }

        print("AUTH RESULT: AUTHENTICATED")
        print("GitHub user:", user.github_username)

        return {
            "authenticated": True,
            "github_user": user.github_username,
            "name": user.name or user.github_username,
        }

    finally:
        if db is not None:
            db.close()


# ============================================================
# Risk Level
# ============================================================

def get_risk_level(score: int):
    if score >= 25:
        return "HIGH"
    elif score >= 10:
        return "MEDIUM"
    return "LOW"


# ============================================================
# AIEE Dataset Directory
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

PROCESSED_DATA_DIR = os.path.join(
    BASE_DIR,
    "data",
    "processed",
)


# ============================================================
# Load AIEE Datasets
# ============================================================

def load_aiee_datasets():

    try:
        dependency_path = os.path.join(
            PROCESSED_DATA_DIR,
            "file_dependency.csv",
        )

        kmeans_path = os.path.join(
            PROCESSED_DATA_DIR,
            "kmeans_cluster.csv",
        )

        dbscan_path = os.path.join(
            PROCESSED_DATA_DIR,
            "dbscan_clustered.csv",
        )

        spark_path = os.path.join(
            PROCESSED_DATA_DIR,
            "spark_file_analytics.csv",
        )

        dependency_df = pd.read_csv(dependency_path)
        kmeans_df = pd.read_csv(kmeans_path)
        dbscan_df = pd.read_csv(dbscan_path)
        spark_df = pd.read_csv(spark_path)

        return (
            dependency_df,
            kmeans_df,
            dbscan_df,
            spark_df,
        )

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Required AIEE dataset is missing: {e}",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AIEE datasets could not be loaded: {e}",
        )


# ============================================================
# Validate Repository History Dataset
# ============================================================

def validate_repository_history_dataset():

    dependency_path = os.path.join(
        PROCESSED_DATA_DIR,
        "file_dependency.csv",
    )

    if not os.path.exists(dependency_path):
        raise HTTPException(
            status_code=500,
            detail=(
                "Repository-specific file dependency "
                "dataset was not generated."
            ),
        )

    try:
        dependency_df = pd.read_csv(dependency_path)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not read repository history dataset: "
                f"{e}"
            ),
        )

    if dependency_df.empty:
        raise HTTPException(
            status_code=500,
            detail="Repository history dataset is empty.",
        )

    return dependency_df


# ============================================================
# Repository Analysis Endpoint
# ============================================================

@app.post("/analyze")
async def analyze_repository(
    request: Request,
    repo: str,
):
    """
    Analyze a GitHub repository and return:
    - Changed files
    - Historical co-change relationships
    - KMeans and DBSCAN clustering information
    - Risk scores
    - Recommended potentially affected files
    """

    db = None

    try:
        # ----------------------------------------------------
        # Authenticate using cookie or Bearer session
        # ----------------------------------------------------

        db, session = get_authenticated_session(request)

        if not session:
            raise HTTPException(
                status_code=401,
                detail=(
                    "Authentication required. Please sign in "
                    "with GitHub and try again."
                ),
            )

        user = session.user

        if not user:
            raise HTTPException(
                status_code=401,
                detail="The authenticated GitHub user was not found.",
            )

        # ----------------------------------------------------
        # Validate repository input
        # ----------------------------------------------------

        repo = repo.strip()

        if not repo:
            raise HTTPException(
                status_code=400,
                detail="Repository name or URL is required.",
            )

        print("\n" + "=" * 70)
        print("AIEE REPOSITORY ANALYSIS")
        print("=" * 70)
        print("Repository:", repo)
        print("Authenticated user:", user.github_username)

        # ----------------------------------------------------
        # STEP 1: Detect recent repository changes
        # ----------------------------------------------------

        changes_result = detect_changes(repo)

        if isinstance(changes_result, dict):
            changed_files = changes_result.get(
                "changed_files", []
            )
        else:
            changed_files = changes_result or []

        # ----------------------------------------------------
        # STEP 2: Analyze repository history
        # ----------------------------------------------------

        history_result = detect_repository_history(repo)

        if not isinstance(history_result, dict):
            raise HTTPException(
                status_code=500,
                detail=(
                    "Repository history analysis returned "
                    "an unexpected result."
                ),
            )

        # ----------------------------------------------------
        # STEP 3: Generate ML datasets
        # ----------------------------------------------------

        pipeline_result = run_repository_ml_pipeline(repo)

        # ----------------------------------------------------
        # STEP 4: Load generated datasets
        # ----------------------------------------------------

        (
            dependency_df,
            kmeans_df,
            dbscan_df,
            spark_df,
        ) = load_aiee_datasets()

        # ----------------------------------------------------
        # STEP 5: Validate dependency dataset
        # ----------------------------------------------------

        dependency_df = validate_repository_history_dataset()

        # ----------------------------------------------------
        # STEP 6: Build file lookup structures
        # ----------------------------------------------------

        dependency_columns = set(dependency_df.columns)
        kmeans_columns = set(kmeans_df.columns)
        dbscan_columns = set(dbscan_df.columns)
        spark_columns = set(spark_df.columns)

        # Find compatible column names from the generated files.
        def find_column(columns, candidates):
            for candidate in candidates:
                if candidate in columns:
                    return candidate
            return None

        dependency_file_col = find_column(
            dependency_columns,
            ["file", "file_path", "source_file", "filename"],
        )

        dependency_related_col = find_column(
            dependency_columns,
            [
                "related_file",
                "target_file",
                "dependent_file",
                "co_changed_file",
            ],
        )

        dependency_count_col = find_column(
            dependency_columns,
            [
                "dependency_count",
                "co_change_count",
                "count",
                "frequency",
            ],
        )

        kmeans_file_col = find_column(
            kmeans_columns,
            ["file", "file_path", "filename"],
        )

        kmeans_cluster_col = find_column(
            kmeans_columns,
            ["kmeans_cluster", "cluster", "cluster_label"],
        )

        dbscan_file_col = find_column(
            dbscan_columns,
            ["file", "file_path", "filename"],
        )

        dbscan_cluster_col = find_column(
            dbscan_columns,
            ["dbscan_cluster", "cluster", "cluster_label"],
        )

        spark_file_col = find_column(
            spark_columns,
            ["file", "file_path", "filename"],
        )

        spark_frequency_col = find_column(
            spark_columns,
            [
                "file_frequency",
                "change_frequency",
                "commit_count",
                "change_count",
                "frequency",
            ],
        )

        # ----------------------------------------------------
        # STEP 7: Validate required columns
        # ----------------------------------------------------

        if not dependency_file_col:
            raise HTTPException(
                status_code=500,
                detail=(
                    "The dependency dataset does not contain "
                    "a recognized file column."
                ),
            )

        if not kmeans_file_col or not kmeans_cluster_col:
            raise HTTPException(
                status_code=500,
                detail=(
                    "The KMeans dataset is missing its file "
                    "or cluster column."
                ),
            )

        if not dbscan_file_col or not dbscan_cluster_col:
            raise HTTPException(
                status_code=500,
                detail=(
                    "The DBSCAN dataset is missing its file "
                    "or cluster column."
                ),
            )

        # ----------------------------------------------------
        # STEP 8: Build file-to-cluster mappings
        # ----------------------------------------------------

        kmeans_mapping = {}

        for _, row in kmeans_df.iterrows():
            file_name = str(row[kmeans_file_col])
            cluster = row[kmeans_cluster_col]
            kmeans_mapping[file_name] = cluster

        dbscan_mapping = {}

        for _, row in dbscan_df.iterrows():
            file_name = str(row[dbscan_file_col])
            cluster = row[dbscan_cluster_col]
            dbscan_mapping[file_name] = cluster

        # ----------------------------------------------------
        # STEP 9: Build file-frequency mapping
        # ----------------------------------------------------

        frequency_mapping = {}

        if spark_file_col and spark_frequency_col:
            for _, row in spark_df.iterrows():
                file_name = str(row[spark_file_col])

                try:
                    frequency = int(row[spark_frequency_col])
                except (ValueError, TypeError):
                    frequency = 0

                frequency_mapping[file_name] = frequency

        # ----------------------------------------------------
        # STEP 10: Build dependency lookup
        # ----------------------------------------------------

        dependency_mapping = {}

        if dependency_related_col:
            for _, row in dependency_df.iterrows():
                source_file = str(row[dependency_file_col])
                target_file = str(row[dependency_related_col])

                if dependency_count_col:
                    try:
                        count = int(row[dependency_count_col])
                    except (ValueError, TypeError):
                        count = 1
                else:
                    count = 1

                dependency_mapping[
                    (source_file, target_file)
                ] = count

                dependency_mapping[
                    (target_file, source_file)
                ] = count

        # ----------------------------------------------------
        # STEP 11: Calculate recommendations
        # ----------------------------------------------------

        recommendations = []

        changed_files = [
            str(file_name)
            for file_name in changed_files
            if file_name
        ]

        all_files = set()

        all_files.update(kmeans_mapping.keys())
        all_files.update(dbscan_mapping.keys())
        all_files.update(frequency_mapping.keys())

        if dependency_related_col:
            all_files.update(
                dependency_df[dependency_file_col]
                .dropna()
                .astype(str)
                .tolist()
            )
            all_files.update(
                dependency_df[dependency_related_col]
                .dropna()
                .astype(str)
                .tolist()
            )

        for changed_file in changed_files:
            for affected_file in all_files:

                if affected_file == changed_file:
                    continue

                dependency_score = dependency_mapping.get(
                    (changed_file, affected_file),
                    0,
                )

                frequency_score = frequency_mapping.get(
                    affected_file,
                    0,
                )

                changed_kmeans = kmeans_mapping.get(
                    changed_file
                )

                affected_kmeans = kmeans_mapping.get(
                    affected_file
                )

                changed_dbscan = dbscan_mapping.get(
                    changed_file
                )

                affected_dbscan = dbscan_mapping.get(
                    affected_file
                )

                same_kmeans = (
                    changed_kmeans is not None
                    and affected_kmeans is not None
                    and str(changed_kmeans) == str(affected_kmeans)
                )

                same_dbscan = (
                    changed_dbscan is not None
                    and affected_dbscan is not None
                    and str(changed_dbscan) == str(affected_dbscan)
                )

                # Ignore files without any evidence of a relationship.
                if not (
                    dependency_score > 0
                    or frequency_score > 0
                    or same_kmeans
                    or same_dbscan
                    or affected_dbscan == -1
                ):
                    continue

                final_score = (
                    dependency_score * 5
                    + frequency_score
                    + (10 if same_kmeans else 0)
                    + (5 if same_dbscan else 0)
                    + (5 if affected_dbscan == -1 else 0)
                )

                risk_level = get_risk_level(final_score)

                reasons = []

                if dependency_score > 0:
                    reasons.append(
                        "historically changed together "
                        f"{dependency_score} times"
                    )

                if frequency_score > 0:
                    reasons.append(
                        "file changed "
                        f"{frequency_score} times "
                        "in repository history"
                    )

                if same_kmeans:
                    reasons.append(
                        "both files belong to the same KMeans cluster"
                    )

                if same_dbscan:
                    reasons.append(
                        "both files belong to the same DBSCAN cluster"
                    )

                if affected_dbscan == -1:
                    reasons.append(
                        "file is identified as a DBSCAN outlier"
                    )

                if not reasons:
                    reasons.append("historical relationship detected")

                recommendations.append({
                    "changed_file": changed_file,
                    "affected_file": affected_file,
                    "risk_level": risk_level,
                    "final_score": final_score,
                    "dependency_count": dependency_score,
                    "file_frequency": frequency_score,
                    "kmeans_cluster": affected_kmeans,
                    "dbscan_cluster": affected_dbscan,
                    "same_kmeans_cluster": same_kmeans,
                    "same_dbscan_cluster": same_dbscan,
                    "reason": ". ".join(reasons),
                })

        # ----------------------------------------------------
        # STEP 12: Aggregate by affected file
        # ----------------------------------------------------

        aggregated_recommendations = {}

        for recommendation in recommendations:
            affected_file = recommendation["affected_file"]

            if affected_file not in aggregated_recommendations:
                aggregated_recommendations[affected_file] = {
                    **recommendation,
                    "changed_files": [
                        recommendation["changed_file"]
                    ],
                }
                continue

            existing = aggregated_recommendations[affected_file]

            changed_file = recommendation["changed_file"]

            if changed_file not in existing["changed_files"]:
                existing["changed_files"].append(changed_file)

            if (
                recommendation["final_score"]
                > existing["final_score"]
            ):
                for key in (
                    "risk_level",
                    "final_score",
                    "dependency_count",
                    "file_frequency",
                    "kmeans_cluster",
                    "dbscan_cluster",
                    "same_kmeans_cluster",
                    "same_dbscan_cluster",
                    "reason",
                ):
                    existing[key] = recommendation[key]

        recommendations = list(
            aggregated_recommendations.values()
        )

        recommendations.sort(
            key=lambda item: item["final_score"],
            reverse=True,
        )

        # ----------------------------------------------------
        # STEP 13: Return API response
        # ----------------------------------------------------

        print("\n" + "=" * 70)
        print("AIEE ANALYSIS RESULTS")
        print("=" * 70)
        print("Total recommendations:", len(recommendations))

        return {
            "repository": repo,
            "status": "analysis_completed",
            "authenticated_user": user.github_username,
            "changed_files": changed_files,
            "historical_analysis": {
                "commits_processed": history_result.get(
                    "commits_processed", 0
                ),
                "unique_files": history_result.get(
                    "unique_files", 0
                ),
                "co_change_relationships": history_result.get(
                    "co_change_relationships", 0
                ),
            },
            "ml_pipeline": {
                "feature_dataset": "generated",
                "kmeans": "generated",
                "dbscan": "generated",
                "file_analytics": "generated",
                "pipeline_result": pipeline_result,
            },
            "total_recommendations": len(recommendations),
            "recommendations": recommendations[:20],
        }

    except HTTPException:
        raise

    except Exception as e:
        print("\nUnexpected AIEE analysis error:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"AIEE repository analysis failed: {str(e)}",
        )

    finally:
        if db is not None:
            db.close()


# ============================================================
# Run Application
# ============================================================

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )