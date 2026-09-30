from app.database import SessionLocal
from app.models_db import Session as DBSession
from scripts.repository_history import detect_repository_history


# ============================================================
# Get the latest AIEE session from PostgreSQL
# ============================================================

db = SessionLocal()

try:

    session = (
        db.query(DBSession)
        .order_by(DBSession.created_at.desc())
        .first()
    )

    if not session:
        raise RuntimeError(
            "No AIEE session found in PostgreSQL. "
            "Login with GitHub first."
        )

    access_token = session.access_token

    if not access_token:
        raise RuntimeError(
            "The stored GitHub access token is empty."
        )

    print("=" * 70)
    print("TESTING REPOSITORY HISTORY EXTRACTION")
    print("=" * 70)

    print(
        "\nRepository: Chandanpl/PilotWatch"
    )

    print(
        "OAuth token available:",
        bool(access_token)
    )

    # ========================================================
    # Generate repository-specific history
    # ========================================================

    result = detect_repository_history(
        "Chandanpl/PilotWatch",
        access_token,
        max_commits=100
    )

    # ========================================================
    # Display result
    # ========================================================

    print("\n" + "=" * 70)
    print("TEST RESULT")
    print("=" * 70)

    print(
        "Commits processed:",
        result["commits_processed"]
    )

    print(
        "Unique files:",
        result["unique_files"]
    )

    print(
        "Co-change relationships:",
        result["co_change_relationships"]
    )

    print(
        "\nGenerated files:"
    )

    print(
        result["commit_history"]
    )

    print(
        result["file_dependency"]
    )

    print(
        result["file_frequency"]
    )

finally:

    db.close()