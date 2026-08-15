import uvicorn
import pandas as pd

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from app.github_auth import (
    router as github_auth_router,
    github_sessions,
)

from scripts.change_detector import detect_changes


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

    session_id = request.cookies.get(
        "aiee_session"
    )

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

    print(
        "Cookie received:",
        bool(session_id)
    )

    print(
        "Session ID:",
        session_id
    )

    print(
        "All cookies:",
        dict(request.cookies)
    )

    print(
        "Active sessions:",
        len(github_sessions)
    )

    # --------------------------------------------------------
    # No session cookie
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

    # --------------------------------------------------------
    # Find server-side session
    # --------------------------------------------------------

    session = github_sessions.get(
        session_id
    )

    # --------------------------------------------------------
    # Session not found
    # --------------------------------------------------------

    if not session:

        print(
            "AUTH RESULT: NOT AUTHENTICATED "
            "(SESSION NOT FOUND)"
        )

        print("=" * 60)

        return {
            "authenticated": False,
            "message": (
                "GitHub session is invalid or expired."
            ),
        }

    # --------------------------------------------------------
    # Authenticated
    # --------------------------------------------------------

    print(
        "AUTH RESULT: AUTHENTICATED",
        "| GitHub user:",
        session.get("username"),
    )

    print("=" * 60)

    return {
        "authenticated": True,
        "github_user": session.get("username"),
        "name": (
            session.get("name")
            or session.get("username")
        ),
    }


# ============================================================
# Risk Level
# ============================================================

def get_risk_level(score):

    if score >= 25:
        return "HIGH"

    elif score >= 10:
        return "MEDIUM"

    else:
        return "LOW"


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

    # ========================================================
    # Step 0: Get GitHub Session
    # ========================================================

    session_id = request.cookies.get(
        "aiee_session"
    )

    # --------------------------------------------------------
    # Check session
    # --------------------------------------------------------

    if not session_id:

        raise HTTPException(
            status_code=401,
            detail=(
                "GitHub authentication required. "
                "Please login with GitHub first."
            ),
        )

    # --------------------------------------------------------
    # Get session information
    # --------------------------------------------------------

    session = github_sessions.get(
        session_id
    )

    if not session:

        raise HTTPException(
            status_code=401,
            detail=(
                "GitHub session expired. "
                "Please login again."
            ),
        )

    # --------------------------------------------------------
    # Get GitHub access token
    # --------------------------------------------------------

    access_token = session.get(
        "access_token"
    )

    if not access_token:

        raise HTTPException(
            status_code=401,
            detail=(
                "GitHub access token not available. "
                "Please login again."
            ),
        )

    print(
        "\nGitHub user:",
        session.get("username"),
    )

    # ========================================================
    # Step 1: Detect latest changed files
    # ========================================================

    try:

        print(
            "\nStarting GitHub change detection..."
        )

        # ----------------------------------------------------
        # IMPORTANT:
        # Current change_detector.py accepts only one
        # argument: the repository URL.
        # ----------------------------------------------------

        changed_files = detect_changes(
            repo
        )

        print(
            "GitHub change detection completed."
        )

    except Exception as e:

        print(
            "\nGitHub change detection error:",
            str(e),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "GitHub change detection failed: "
                f"{str(e)}"
            ),
        )

    # ========================================================
    # Check changed files
    # ========================================================

    if not changed_files:

        return {
            "repository": repo,
            "status": "no_changes",
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
            file_name,
        )

    # ========================================================
    # Step 2: Load AIEE datasets
    # ========================================================

    try:

        dependency_df = pd.read_csv(
            "data/processed/file_dependency.csv"
        )

        kmeans_df = pd.read_csv(
            "data/processed/kmeans_cluster.csv"
        )

        dbscan_df = pd.read_csv(
            "data/processed/dbscan_clustered.csv"
        )

        spark_df = pd.read_csv(
            "data/processed/spark_file_analytics.csv"
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "AIEE datasets could not be loaded: "
                f"{str(e)}"
            ),
        )

    # ========================================================
    # Helper: KMeans Cluster
    # ========================================================

    def get_kmeans_cluster(
        file_name
    ):

        row = kmeans_df[
            kmeans_df["file_name"]
            == file_name
        ]

        if row.empty:
            return None

        return int(
            row.iloc[0]["cluster"]
        )

    # ========================================================
    # Helper: DBSCAN Cluster
    # ========================================================

    def get_dbscan_cluster(
        file_name
    ):

        row = dbscan_df[
            dbscan_df["file_name"]
            == file_name
        ]

        if row.empty:
            return None

        return int(
            row.iloc[0]["cluster"]
        )

    # ========================================================
    # Helper: PySpark File Frequency
    # ========================================================

    def get_file_frequency(
        file_name
    ):

        row = spark_df[
            spark_df["file_name"]
            == file_name
        ]

        if row.empty:
            return 0

        return int(
            row.iloc[0]["file_changes"]
        )

    # ========================================================
    # Step 3: Hybrid Recommendation
    # ========================================================

    recommendations = []

    for changed_file in changed_files:

        print(
            f"\nAnalyzing changed file: "
            f"{changed_file}"
        )

        # ----------------------------------------------------
        # Find historically related files
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # Current file clusters
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # Analyze related files
        # ----------------------------------------------------

        for _, row in related.iterrows():

            if row["file_a"] == changed_file:

                affected_file = row[
                    "file_b"
                ]

            else:

                affected_file = row[
                    "file_a"
                ]

            # =================================================
            # Related file information
            # =================================================

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

            # =================================================
            # KMeans similarity
            # =================================================

            same_kmeans = (

                current_kmeans is not None

                and

                affected_kmeans is not None

                and

                current_kmeans
                ==
                affected_kmeans

            )

            # =================================================
            # DBSCAN similarity
            #
            # -1 means DBSCAN noise/outlier.
            # =================================================

            same_dbscan = (

                current_dbscan is not None

                and

                affected_dbscan is not None

                and

                current_dbscan != -1

                and

                affected_dbscan != -1

                and

                current_dbscan
                ==
                affected_dbscan

            )

            # =================================================
            # Hybrid Score
            # =================================================

            dependency_score = int(
                row["count"]
            )

            frequency_score = int(
                file_frequency
            )

            final_score = (
                dependency_score
                +
                frequency_score
            )

            # -------------------------------------------------
            # Same KMeans cluster
            # -------------------------------------------------

            if same_kmeans:

                final_score += 5

            # -------------------------------------------------
            # Same DBSCAN cluster
            # -------------------------------------------------

            if same_dbscan:

                final_score += 3

            # -------------------------------------------------
            # DBSCAN outlier
            # -------------------------------------------------

            if affected_dbscan == -1:

                final_score += 2

            # =================================================
            # Risk Level
            # =================================================

            risk_level = get_risk_level(
                final_score
            )

            # =================================================
            # Explanation
            # =================================================

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
                    "file is identified as a DBSCAN "
                    "outlier"
                )

            explanation = ". ".join(
                reasons
            )

            # =================================================
            # Store Recommendation
            # =================================================

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

    # ========================================================
    # Step 4: Remove Duplicate Recommendations
    # ========================================================

    unique_recommendations = {}

    for recommendation in recommendations:

        key = (

            recommendation[
                "changed_file"
            ],

            recommendation[
                "affected_file"
            ],

        )

        if (

            key
            not in unique_recommendations

            or

            recommendation[
                "final_score"
            ]

            >

            unique_recommendations[
                key
            ][
                "final_score"
            ]

        ):

            unique_recommendations[
                key
            ] = recommendation

    recommendations = list(
        unique_recommendations.values()
    )

    # ========================================================
    # Step 5: Sort Recommendations
    # ========================================================

    recommendations.sort(
        key=lambda x:
            x["final_score"],
        reverse=True,
    )

    # ========================================================
    # Step 6: Display Results
    # ========================================================

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
                "Reason:",
                recommendation[
                    "reason"
                ]
            )

    # ========================================================
    # Step 7: API Response
    # ========================================================

    return {

        "repository":
            repo,

        "status":
            "analysis_completed",

        "authenticated_user":
            session.get(
                "username"
            ),

        "changed_files":
            changed_files,

        "total_recommendations":
            len(
                recommendations
            ),

        "recommendations":
            recommendations[:20],

    }


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