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


# ============================================================
# GitHub Authentication Router
# ============================================================

app.include_router(github_auth_router)


# ============================================================
# CORS Middleware
# ============================================================

# CORS configuration
allowed_origins = [
    # Kubernetes / local frontend
    "http://localhost:30080",
    "http://127.0.0.1:30080",

    # Vite development frontend
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Production frontend URL is supplied through the FRONTEND_URL
# environment variable on Render.
frontend_url = os.getenv("FRONTEND_URL")

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
# Database Session Helper
# ============================================================

def get_authenticated_session(request: Request):
    """
    Retrieve the authenticated AIEE session from PostgreSQL.

    Returns:
        (db, session)

    If authentication fails:
        (None, None)
    """

    session_id = request.cookies.get("aiee_session")

    if not session_id:
        return None, None

    db = SessionLocal()

    try:

        session = db.get(DBSession, session_id)

        if not session:
            db.close()
            return None, None

        # ----------------------------------------------------
        # Check session expiration
        # ----------------------------------------------------

        if session.expires_at is not None:

            now = datetime.now(timezone.utc)

            expires_at = session.expires_at

            # PostgreSQL may return a naive datetime.
            # Treat it as UTC safely.
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
# GitHub Authentication Status
# ============================================================

@app.get("/auth/status")
async def auth_status(request: Request):

    print("\n" + "=" * 60)
    print("AIEE AUTH STATUS")
    print("=" * 60)

    print(
        "Request origin:",
        request.headers.get("origin")
    )

    print(
        "Request host:",
        request.headers.get("host")
    )

    session_id = request.cookies.get("aiee_session")

    print(
        "Cookie received:",
        bool(session_id)
    )

    # --------------------------------------------------------
    # No cookie
    # --------------------------------------------------------

    if not session_id:

        print(
            "AUTH RESULT: NOT AUTHENTICATED "
            "(NO COOKIE)"
        )

        print("=" * 60)

        return {
            "authenticated": False,
            "message": (
                "User is not logged in with GitHub."
            ),
        }

    db = None

    try:

        # ----------------------------------------------------
        # Get PostgreSQL session
        # ----------------------------------------------------

        db, session = get_authenticated_session(
            request
        )

        if not session:

            print(
                "AUTH RESULT: NOT AUTHENTICATED "
                "(SESSION NOT FOUND OR EXPIRED)"
            )

            print("=" * 60)

            return {
                "authenticated": False,
                "message": (
                    "GitHub session is invalid or expired."
                ),
            }

        # ----------------------------------------------------
        # Get user from relationship
        # ----------------------------------------------------

        user = session.user

        if not user:

            print(
                "AUTH RESULT: NOT AUTHENTICATED "
                "(USER NOT FOUND)"
            )

            print("=" * 60)

            return {
                "authenticated": False,
                "message": (
                    "Associated GitHub user was not found."
                ),
            }

        print(
            "AUTH RESULT: AUTHENTICATED",
            "| GitHub user:",
            user.github_username,
        )

        print("=" * 60)

        return {
            "authenticated": True,
            "github_user": user.github_username,
            "name": (
                user.name
                or user.github_username
            ),
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
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

PROCESSED_DATA_DIR = os.path.join(
    BASE_DIR,
    "data",
    "processed"
)


# ============================================================
# Load AIEE Datasets
# ============================================================

def load_aiee_datasets():

    try:

        dependency_path = os.path.join(
            PROCESSED_DATA_DIR,
            "file_dependency.csv"
        )

        kmeans_path = os.path.join(
            PROCESSED_DATA_DIR,
            "kmeans_cluster.csv"
        )

        dbscan_path = os.path.join(
            PROCESSED_DATA_DIR,
            "dbscan_clustered.csv"
        )

        spark_path = os.path.join(
            PROCESSED_DATA_DIR,
            "spark_file_analytics.csv"
        )

        dependency_df = pd.read_csv(
            dependency_path
        )

        kmeans_df = pd.read_csv(
            kmeans_path
        )

        dbscan_df = pd.read_csv(
            dbscan_path
        )

        spark_df = pd.read_csv(
            spark_path
        )

        return (
            dependency_df,
            kmeans_df,
            dbscan_df,
            spark_df,
        )

    except FileNotFoundError as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Required AIEE dataset is missing: "
                f"{str(e)}"
            ),
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "AIEE datasets could not be loaded: "
                f"{str(e)}"
            ),
        )


# ============================================================
# Validate Repository History Dataset
# ============================================================

def validate_repository_history_dataset():

    dependency_path = os.path.join(
        PROCESSED_DATA_DIR,
        "file_dependency.csv"
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

        dependency_df = pd.read_csv(
            dependency_path
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Repository dependency dataset "
                f"could not be read: {str(e)}"
            ),
        )

    required_columns = {
        "file_a",
        "file_b",
        "count",
    }

    missing_columns = (
        required_columns
        - set(dependency_df.columns)
    )

    if missing_columns:

        raise HTTPException(
            status_code=500,
            detail=(
                "Repository dependency dataset "
                "has missing columns: "
                f"{sorted(missing_columns)}"
            ),
        )

    return dependency_df


# ============================================================
# Validate ML Pipeline Datasets
# ============================================================

def validate_ml_pipeline_datasets():

    required_files = [
        "feature_dataset.csv",
        "kmeans_cluster.csv",
        "dbscan_clustered.csv",
        "spark_file_analytics.csv",
    ]

    missing_files = []

    for file_name in required_files:

        file_path = os.path.join(
            PROCESSED_DATA_DIR,
            file_name
        )

        if not os.path.exists(file_path):

            missing_files.append(
                file_name
            )

    if missing_files:

        raise HTTPException(
            status_code=500,
            detail=(
                "Repository ML pipeline did not generate "
                "the required datasets: "
                f"{missing_files}"
            ),
        )

    return True


# ============================================================
# AIEE Repository Analysis
# ============================================================

@app.post("/analyze")
async def analyze_repository(
    repo: str,
    request: Request,
):

    print("\n" + "=" * 70)
    print("AIEE REPOSITORY ANALYSIS")
    print("=" * 70)

    print(
        "\nRepository:",
        repo,
    )

    db = None

    try:

        # ====================================================
        # STEP 0: Get PostgreSQL GitHub Session
        # ====================================================

        session_id = request.cookies.get(
            "aiee_session"
        )

        # ----------------------------------------------------
        # Check cookie
        # ----------------------------------------------------

        if not session_id:

            raise HTTPException(
                status_code=401,
                detail=(
                    "GitHub authentication required. "
                    "Please login with GitHub first."
                ),
            )

        # ----------------------------------------------------
        # Retrieve PostgreSQL session
        # ----------------------------------------------------

        db, session = get_authenticated_session(
            request
        )

        if not session:

            raise HTTPException(
                status_code=401,
                detail=(
                    "GitHub session expired. "
                    "Please login again."
                ),
            )

        # ----------------------------------------------------
        # Get PostgreSQL user
        # ----------------------------------------------------

        user = session.user

        if not user:

            raise HTTPException(
                status_code=401,
                detail=(
                    "Associated GitHub user was not found. "
                    "Please login again."
                ),
            )

        # ----------------------------------------------------
        # Get OAuth access token
        # ----------------------------------------------------

        access_token = session.access_token

        if not access_token:

            raise HTTPException(
                status_code=401,
                detail=(
                    "GitHub access token is not available. "
                    "Please login again."
                ),
            )

        print(
            "\nGitHub user:",
            user.github_username
        )

        print(
            "GitHub OAuth token available:",
            bool(access_token)
        )

        # ====================================================
        # STEP 1: Detect Latest GitHub Changes
        # ====================================================

        try:

            print(
                "\nStarting GitHub change detection..."
            )

            changed_files = detect_changes(
                repo,
                access_token
            )

            print(
                "GitHub change detection completed."
            )

        except ValueError as e:

            print(
                "\nGitHub change detection error:",
                str(e)
            )

            raise HTTPException(
                status_code=401,
                detail=str(e),
            )

        except Exception as e:

            print(
                "\nGitHub change detection error:",
                str(e)
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "GitHub change detection failed: "
                    f"{str(e)}"
                ),
            )

        # ====================================================
        # STEP 2: Check Changed Files
        # ====================================================

        if not changed_files:

            print(
                "\nNo changed files detected."
            )

            return {
                "repository": repo,
                "status": "no_changes",
                "authenticated_user":
                    user.github_username,
                "changed_files": [],
                "total_recommendations": 0,
                "recommendations": [],
            }

        print(
            "\nChanged files:"
        )

        for file_name in changed_files:

            print(
                " -",
                file_name
            )

        # ====================================================
        # STEP 3: Generate Repository-Specific History
        # ====================================================

        print("\n" + "=" * 70)
        print("AIEE REPOSITORY HISTORY ANALYSIS")
        print("=" * 70)

        print(
            "\nBuilding historical datasets for:",
            repo
        )

        try:

            history_result = (
                detect_repository_history(
                    repo,
                    access_token,
                    max_commits=500
                )
            )

            print(
                "\nRepository historical data "
                "generated successfully."
            )

            print(
                "Commits processed:",
                history_result[
                    "commits_processed"
                ]
            )

            print(
                "Unique files:",
                history_result[
                    "unique_files"
                ]
            )

            print(
                "Co-change relationships:",
                history_result[
                    "co_change_relationships"
                ]
            )

        except ValueError as e:

            print(
                "\nRepository history generation error:",
                str(e)
            )

            raise HTTPException(
                status_code=401,
                detail=str(e),
            )

        except Exception as e:

            print(
                "\nRepository history generation error:",
                str(e)
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Repository historical data "
                    "generation failed: "
                    f"{str(e)}"
                ),
            )

        # ====================================================
        # STEP 4: Validate Repository History Dataset
        # ====================================================

        print(
            "\nValidating repository-specific "
            "historical dataset..."
        )

        repository_dependency_df = (
            validate_repository_history_dataset()
        )

        print(
            "Repository dependency dataset "
            "validated successfully."
        )

        print(
            "Historical relationships:",
            len(repository_dependency_df)
        )

        # ====================================================
        # STEP 5: Run Repository ML Pipeline
        # ====================================================

        print("\n" + "=" * 70)
        print("AIEE REPOSITORY ML PIPELINE")
        print("=" * 70)

        print(
            "\nRunning repository-specific "
            "machine learning pipeline..."
        )

        try:

            ml_result = (
                run_repository_ml_pipeline()
            )

            print(
                "\nRepository ML pipeline "
                "completed successfully."
            )

            if isinstance(ml_result, dict):

                for key, value in ml_result.items():

                    print(
                        f"{key}:",
                        value
                    )

        except Exception as e:

            print(
                "\nRepository ML pipeline error:",
                str(e)
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Repository ML pipeline failed: "
                    f"{str(e)}"
                ),
            )

        # ====================================================
        # STEP 6: Validate ML Pipeline Output
        # ====================================================

        print(
            "\nValidating ML pipeline datasets..."
        )

        validate_ml_pipeline_datasets()

        print(
            "ML pipeline datasets validated successfully."
        )

        # ====================================================
        # STEP 7: Load Repository-Specific AIEE Datasets
        # ====================================================

        try:

            (
                dependency_df,
                kmeans_df,
                dbscan_df,
                spark_df,
            ) = load_aiee_datasets()

        except HTTPException:

            raise

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=(
                    "AIEE datasets could not be loaded: "
                    f"{str(e)}"
                ),
            )

        # ----------------------------------------------------
        # file_dependency.csv is generated from the selected
        # repository, therefore it is repository-specific.
        # ----------------------------------------------------

        dependency_df = repository_dependency_df

        print(
            "\nAIEE datasets loaded successfully."
        )

        print(
            "Dependency relationships:",
            len(dependency_df)
        )

        print(
            "KMeans records:",
            len(kmeans_df)
        )

        print(
            "DBSCAN records:",
            len(dbscan_df)
        )

        print(
            "File analytics records:",
            len(spark_df)
        )

        # ====================================================
        # STEP 8: KMeans Helper
        # ====================================================

        def get_kmeans_cluster(file_name):

            if "file_name" not in kmeans_df.columns:

                return None

            row = kmeans_df[
                kmeans_df["file_name"] == file_name
            ]

            if row.empty:

                return None

            try:

                return int(
                    row.iloc[0]["cluster"]
                )

            except Exception:

                return None

        # ====================================================
        # STEP 9: DBSCAN Helper
        # ====================================================

        def get_dbscan_cluster(file_name):

            if "file_name" not in dbscan_df.columns:

                return None

            row = dbscan_df[
                dbscan_df["file_name"] == file_name
            ]

            if row.empty:

                return None

            try:

                return int(
                    row.iloc[0]["cluster"]
                )

            except Exception:

                return None

        # ====================================================
        # STEP 10: File Frequency Helper
        # ====================================================

        def get_file_frequency(file_name):

            if "file_name" not in spark_df.columns:

                return 0

            row = spark_df[
                spark_df["file_name"] == file_name
            ]

            if row.empty:

                return 0

            try:

                return int(
                    row.iloc[0]["file_changes"]
                )

            except Exception:

                return 0

        # ====================================================
        # STEP 11: Hybrid Recommendation
        # ====================================================

        recommendations = []

        for changed_file in changed_files:

            print(
                f"\nAnalyzing changed file: "
                f"{changed_file}"
            )

            # ------------------------------------------------
            # Find historically related files
            # ------------------------------------------------

            related = dependency_df[
                (
                    dependency_df["file_a"]
                    == changed_file
                )
                |
                (
                    dependency_df["file_b"]
                    == changed_file
                )
            ].copy()

            if related.empty:

                print(
                    "No historical dependencies found."
                )

                continue

            print(
                "Historical dependencies found:",
                len(related)
            )

            # ------------------------------------------------
            # Current file clustering
            # ------------------------------------------------

            current_kmeans = (
                get_kmeans_cluster(
                    changed_file
                )
            )

            current_dbscan = (
                get_dbscan_cluster(
                    changed_file
                )
            )

            # ------------------------------------------------
            # Analyze related files
            # ------------------------------------------------

            for _, row in related.iterrows():

                if row["file_a"] == changed_file:

                    affected_file = row["file_b"]

                else:

                    affected_file = row["file_a"]

                # =============================================
                # Related File Information
                # =============================================

                affected_kmeans = (
                    get_kmeans_cluster(
                        affected_file
                    )
                )

                affected_dbscan = (
                    get_dbscan_cluster(
                        affected_file
                    )
                )

                file_frequency = (
                    get_file_frequency(
                        affected_file
                    )
                )

                # =============================================
                # KMeans Similarity
                # =============================================

                same_kmeans = (
                    current_kmeans is not None
                    and affected_kmeans is not None
                    and current_kmeans == affected_kmeans
                )

                # =============================================
                # DBSCAN Similarity
                # =============================================

                same_dbscan = (
                    current_dbscan is not None
                    and affected_dbscan is not None
                    and current_dbscan != -1
                    and affected_dbscan != -1
                    and current_dbscan == affected_dbscan
                )

                # =============================================
                # Dependency Score
                # =============================================

                try:

                    dependency_score = int(
                        row["count"]
                    )

                except Exception:

                    dependency_score = 0

                # =============================================
                # File Frequency Score
                # =============================================

                frequency_score = int(
                    file_frequency
                )

                # =============================================
                # Hybrid Score
                # =============================================

                final_score = (
                    dependency_score
                    + frequency_score
                )

                # ------------------------------------------------
                # KMeans Bonus
                # ------------------------------------------------

                if same_kmeans:

                    final_score += 5

                # ------------------------------------------------
                # DBSCAN Bonus
                # ------------------------------------------------

                if same_dbscan:

                    final_score += 3

                # ------------------------------------------------
                # DBSCAN Outlier Signal
                # ------------------------------------------------

                # DBSCAN outlier status is informational only.
                # It does not affect the final risk score.

                # =============================================
                # Risk Level
                # =============================================

                risk_level = get_risk_level(
                    final_score
                )

                # =============================================
                # Explanation
                # =============================================

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
                        "both files belong to the same "
                        "KMeans cluster"
                    )

                if same_dbscan:

                    reasons.append(
                        "both files belong to the same "
                        "DBSCAN cluster"
                    )

                if affected_dbscan == -1:

                    reasons.append(
                        "file is identified as a "
                        "DBSCAN outlier"
                    )

                if not reasons:

                    reasons.append(
                        "historical relationship detected"
                    )

                explanation = ". ".join(
                    reasons
                )

                # =============================================
                # Store Recommendation
                # =============================================

                recommendations.append({

                    "changed_file":
                        changed_file,

                    "affected_file":
                        affected_file,

                    "risk_level":
                        risk_level,

                    "final_score":
                        final_score,

                    "dependency_count":
                        dependency_score,

                    "file_frequency":
                        frequency_score,

                    "kmeans_cluster":
                        affected_kmeans,

                    "dbscan_cluster":
                        affected_dbscan,

                    "same_kmeans_cluster":
                        same_kmeans,

                    "same_dbscan_cluster":
                        same_dbscan,

                    "reason":
                        explanation,
                })

        # ====================================================
        # STEP 12: Aggregate Recommendations by Affected File
        # ====================================================

        aggregated_recommendations = {}

        for recommendation in recommendations:

            affected_file = (
                recommendation["affected_file"]
            )

            if (
                affected_file
                not in aggregated_recommendations
            ):

                aggregated_recommendations[
                    affected_file
                ] = {
                    **recommendation,
                    "changed_files": [
                        recommendation["changed_file"]
                    ],
                }

            else:

                existing = (
                    aggregated_recommendations[
                        affected_file
                    ]
                )

                # ------------------------------------------------
                # Add changed file if not already present
                # ------------------------------------------------

                changed_file = (
                    recommendation["changed_file"]
                )

                if (
                    changed_file
                    not in existing["changed_files"]
                ):

                    existing["changed_files"].append(
                        changed_file
                    )

                # ------------------------------------------------
                # Keep strongest score
                # ------------------------------------------------

                if (
                    recommendation["final_score"]
                    >
                    existing["final_score"]
                ):

                    existing["risk_level"] = (
                        recommendation["risk_level"]
                    )

                    existing["final_score"] = (
                        recommendation["final_score"]
                    )

                    existing["dependency_count"] = (
                        recommendation[
                            "dependency_count"
                        ]
                    )

                    existing["file_frequency"] = (
                        recommendation[
                            "file_frequency"
                        ]
                    )

                    existing["kmeans_cluster"] = (
                        recommendation[
                            "kmeans_cluster"
                        ]
                    )

                    existing["dbscan_cluster"] = (
                        recommendation[
                            "dbscan_cluster"
                        ]
                    )

                    existing["same_kmeans_cluster"] = (
                        recommendation[
                            "same_kmeans_cluster"
                        ]
                    )

                    existing["same_dbscan_cluster"] = (
                        recommendation[
                            "same_dbscan_cluster"
                        ]
                    )

                    existing["reason"] = (
                        recommendation["reason"]
                    )

        recommendations = list(
            aggregated_recommendations.values()
        )

        # ====================================================
        # STEP 13: Sort Recommendations
        # ====================================================

        recommendations.sort(
            key=lambda item:
                item["final_score"],
            reverse=True,
        )

        # ====================================================
        # STEP 14: Display Results
        # ====================================================

        print(
            "\n" + "=" * 70
        )

        print(
            "AIEE ANALYSIS RESULTS"
        )

        print(
            "=" * 70
        )

        if not recommendations:

            print(
                "\nNo potentially related files found."
            )

        else:

            print(
                f"\nTotal recommendations: "
                f"{len(recommendations)}"
            )

            for recommendation in (
                recommendations[:20]
            ):

                print(
                    f"\n"
                    f"{recommendation['affected_file']} | "
                    f"Risk: "
                    f"{recommendation['risk_level']} | "
                    f"Score: "
                    f"{recommendation['final_score']} | "
                    f"Dependency: "
                    f"{recommendation['dependency_count']} | "
                    f"Frequency: "
                    f"{recommendation['file_frequency']} | "
                    f"KMeans: "
                    f"{recommendation['kmeans_cluster']} | "
                    f"DBSCAN: "
                    f"{recommendation['dbscan_cluster']}"
                )

                print(
                    "Affected by changed files:",
                    ", ".join(
                        recommendation[
                            "changed_files"
                        ]
                    )
                )

                print(
                    "Reason:",
                    recommendation["reason"]
                )

        # ====================================================
        # STEP 15: API Response
        # ====================================================

        return {

            "repository":
                repo,

            "status":
                "analysis_completed",

            "authenticated_user":
                user.github_username,

            "changed_files":
                changed_files,

            "historical_analysis": {

                "commits_processed":
                    history_result[
                        "commits_processed"
                    ],

                "unique_files":
                    history_result[
                        "unique_files"
                    ],

                "co_change_relationships":
                    history_result[
                        "co_change_relationships"
                    ],
            },

            "ml_pipeline": {

                "feature_dataset":
                    "generated",

                "kmeans":
                    "generated",

                "dbscan":
                    "generated",

                "file_analytics":
                    "generated",
            },

            "total_recommendations":
                len(recommendations),

            "recommendations":
                recommendations[:20],
        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "\nUnexpected AIEE analysis error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "AIEE repository analysis failed: "
                f"{str(e)}"
            ),
        )

    finally:

        # ----------------------------------------------------
        # Always close PostgreSQL connection
        # ----------------------------------------------------

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