import os
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from app.database import SessionLocal
from app.models_db import User, Session as DBSession


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/auth/github",
    tags=["GitHub Authentication"]
)


# ============================================================
# CONFIGURATION
# ============================================================

CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

REDIRECT_URI = os.getenv(
    "GITHUB_REDIRECT_URI",
    "http://127.0.0.1:8000/auth/github/callback"
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://127.0.0.1:5173"
)


# ============================================================
# TEMPORARY OAUTH STATE STORAGE
# ============================================================

# OAuth state is temporary and only used during login.
# For production with multiple backend instances,
# move this to Redis or another shared store.

oauth_states = set()


# ============================================================
# STARTUP CONFIGURATION DISPLAY
# ============================================================

print("\n" + "=" * 60)
print("AIEE GITHUB AUTHENTICATION CONFIGURATION")
print("=" * 60)

print(
    "GitHub Client ID configured:",
    bool(CLIENT_ID)
)

print(
    "GitHub Client Secret configured:",
    bool(CLIENT_SECRET)
)

print(
    "GitHub Redirect URI:",
    REDIRECT_URI
)

print(
    "Frontend URL:",
    FRONTEND_URL
)

print("=" * 60 + "\n")


# ============================================================
# GITHUB LOGIN
# ============================================================

@router.get("/login")
async def github_login():

    print("\n" + "=" * 60)
    print("GITHUB LOGIN REQUEST")
    print("=" * 60)

    if not CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GITHUB_CLIENT_ID is not configured."
        )

    if not CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="GITHUB_CLIENT_SECRET is not configured."
        )

    # --------------------------------------------------------
    # Create OAuth state
    # --------------------------------------------------------

    state = secrets.token_urlsafe(32)

    oauth_states.add(state)

    print("OAuth state created.")
    print("Redirect URI:", REDIRECT_URI)

    # --------------------------------------------------------
    # GitHub OAuth parameters
    # --------------------------------------------------------

    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "state": state,
        "scope": "read:user repo",
    }

    github_url = (
        "https://github.com/login/oauth/authorize?"
        + urlencode(params)
    )

    print("GitHub OAuth URL generated.")
    print("Redirecting user to GitHub...")
    print("=" * 60 + "\n")

    return RedirectResponse(
        url=github_url,
        status_code=307
    )


# ============================================================
# GITHUB CALLBACK
# ============================================================

@router.get("/callback")
async def github_callback(
    code: str,
    state: str
):

    print("\n" + "=" * 60)
    print("GITHUB OAUTH CALLBACK")
    print("=" * 60)

    # --------------------------------------------------------
    # Validate OAuth state
    # --------------------------------------------------------

    if not state:
        raise HTTPException(
            status_code=400,
            detail="OAuth state is missing."
        )

    if state not in oauth_states:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OAuth state."
        )

    oauth_states.discard(state)

    print("OAuth state validated successfully.")

    # ========================================================
    # EXCHANGE CODE FOR ACCESS TOKEN
    # ========================================================

    print(
        "Exchanging GitHub authorization code..."
    )

    try:

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            token_response = await client.post(
                "https://github.com/login/oauth/access_token",

                data={
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": REDIRECT_URI,
                },

                headers={
                    "Accept": "application/json"
                }
            )

    except Exception as e:

        print(
            "GitHub token request failed:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Could not connect to GitHub."
        )

    if token_response.status_code != 200:

        print(
            "GitHub token exchange failed:",
            token_response.status_code
        )

        raise HTTPException(
            status_code=400,
            detail="GitHub token exchange failed."
        )

    token_data = token_response.json()

    print(
        "GitHub token response received."
    )

    access_token = token_data.get(
        "access_token"
    )

    if not access_token:

        raise HTTPException(
            status_code=400,
            detail=(
                token_data.get("error_description")
                or
                "GitHub access token not received."
            )
        )

    print(
        "GitHub access token received successfully."
    )

    # ========================================================
    # GET GITHUB USER
    # ========================================================

    print(
        "Requesting GitHub user information..."
    )

    try:

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            user_response = await client.get(
                "https://api.github.com/user",

                headers={
                    "Authorization":
                        f"Bearer {access_token}",

                    "Accept":
                        "application/vnd.github+json",

                    "X-GitHub-Api-Version":
                        "2022-11-28",
                }
            )

    except Exception as e:

        print(
            "GitHub user request failed:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Could not retrieve GitHub user."
        )

    if user_response.status_code != 200:

        print(
            "GitHub user request failed:",
            user_response.status_code
        )

        raise HTTPException(
            status_code=400,
            detail="Could not retrieve GitHub user."
        )

    user_data = user_response.json()

    github_id = str(
        user_data.get("id")
    )

    username = user_data.get(
        "login"
    )

    name = user_data.get(
        "name"
    )

    if not github_id or github_id == "None":

        raise HTTPException(
            status_code=400,
            detail="GitHub user ID could not be determined."
        )

    if not username:

        raise HTTPException(
            status_code=400,
            detail="GitHub username could not be determined."
        )

    print(
        "GitHub user:",
        username
    )

    # ========================================================
    # DATABASE
    # ========================================================

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # Find existing user
        # ----------------------------------------------------

        result = db.execute(
            select(User).where(
                User.github_id == github_id
            )
        )

        db_user = result.scalar_one_or_none()

        # ----------------------------------------------------
        # Create or update user
        # ----------------------------------------------------

        if db_user is None:

            db_user = User(
                github_id=github_id,
                github_username=username,
                name=name or username,
            )

            db.add(db_user)

            db.commit()

            db.refresh(db_user)

            print(
                "New GitHub user created in PostgreSQL."
            )

        else:

            db_user.github_username = username
            db_user.name = name or username

            db.commit()

            db.refresh(db_user)

            print(
                "Existing GitHub user updated."
            )

        # ----------------------------------------------------
        # Optional cleanup:
        # Remove previous sessions for this user.
        #
        # This keeps one active login session per browser/user
        # during local development.
        # ----------------------------------------------------

        old_sessions = db.execute(
            select(DBSession).where(
                DBSession.user_id == db_user.id
            )
        ).scalars().all()

        for old_session in old_sessions:
            db.delete(old_session)

        db.commit()

        # ----------------------------------------------------
        # Create new session
        # ----------------------------------------------------

        session_id = secrets.token_urlsafe(32)

        now = datetime.now(timezone.utc)

        db_session = DBSession(
            id=session_id,
            user_id=db_user.id,
            access_token=access_token,
            created_at=now,
            expires_at=now + timedelta(hours=1),
        )

        db.add(db_session)

        db.commit()

        print(
            "Session stored successfully in PostgreSQL."
        )

        print(
            "User ID:",
            db_user.id
        )

        print(
            "Session ID created:",
            bool(session_id)
        )

    except Exception as e:

        db.rollback()

        print(
            "Database error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Could not create AIEE database session."
        )

    finally:

        db.close()

    # ========================================================
    # SUCCESS
    # ========================================================

    print("\n" + "=" * 60)
    print("GITHUB AUTHENTICATION SUCCESSFUL")
    print("=" * 60)

    print(
        "GitHub User:",
        username
    )

    print(
        "Name:",
        name or username
    )

    print(
        "PostgreSQL session created:",
        True
    )

    print("=" * 60)

    # ========================================================
    # REDIRECT TO FRONTEND
    # ========================================================

    response = RedirectResponse(
        url=FRONTEND_URL,
        status_code=303
    )

    # ========================================================
    # SESSION COOKIE
    # ========================================================

    response.set_cookie(
        key="aiee_session",
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=3600,
        path="/",
    )

    print("\n" + "=" * 60)
    print("AIEE SESSION COOKIE CREATED")
    print("=" * 60)

    print(
        "Cookie name:",
        "aiee_session"
    )

    print(
        "Cookie value exists:",
        bool(session_id)
    )

    print(
        "Frontend redirect:",
        FRONTEND_URL
    )

    print("=" * 60 + "\n")

    return response


# ============================================================
# CURRENT GITHUB USER
# ============================================================

@router.get("/me")
async def github_me(
    request: Request
):

    session_id = request.cookies.get(
        "aiee_session"
    )

    print("\n" + "=" * 60)
    print("GITHUB SESSION CHECK")
    print("=" * 60)

    print(
        "Cookie received:",
        bool(session_id)
    )

    if not session_id:

        print(
            "RESULT: NOT AUTHENTICATED"
        )

        print("=" * 60)

        return {
            "authenticated": False,
            "github_user": None,
            "name": None,
        }

    db = SessionLocal()

    try:

        result = db.execute(
            select(DBSession).where(
                DBSession.id == session_id
            )
        )

        db_session = result.scalar_one_or_none()

        if db_session is None:

            print(
                "RESULT: SESSION NOT FOUND"
            )

            return {
                "authenticated": False,
                "github_user": None,
                "name": None,
            }

        # ----------------------------------------------------
        # Check expiration
        # ----------------------------------------------------

        now = datetime.now(timezone.utc)

        expires_at = db_session.expires_at

        if expires_at is not None:

            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(
                    tzinfo=timezone.utc
                )

            if expires_at <= now:

                print(
                    "RESULT: SESSION EXPIRED"
                )

                db.delete(db_session)
                db.commit()

                return {
                    "authenticated": False,
                    "github_user": None,
                    "name": None,
                }

        # ----------------------------------------------------
        # Get user
        # ----------------------------------------------------

        db_user = db_session.user

        if db_user is None:

            print(
                "RESULT: USER NOT FOUND"
            )

            return {
                "authenticated": False,
                "github_user": None,
                "name": None,
            }

        print(
            "RESULT: AUTHENTICATED"
        )

        print(
            "GitHub user:",
            db_user.github_username
        )

        print("=" * 60)

        return {
            "authenticated": True,
            "github_user":
                db_user.github_username,
            "name":
                db_user.name or db_user.github_username,
        }

    finally:

        db.close()


# ============================================================
# LOGOUT
# ============================================================

@router.post("/logout")
async def github_logout(
    request: Request
):

    session_id = request.cookies.get(
        "aiee_session"
    )

    print("\n" + "=" * 60)
    print("GITHUB LOGOUT")
    print("=" * 60)

    print(
        "Session exists:",
        bool(session_id)
    )

    if session_id:

        db = SessionLocal()

        try:

            result = db.execute(
                select(DBSession).where(
                    DBSession.id == session_id
                )
            )

            db_session = result.scalar_one_or_none()

            if db_session:

                db.delete(db_session)

                db.commit()

                print(
                    "PostgreSQL session removed."
                )

        except Exception as e:

            db.rollback()

            print(
                "Logout database error:",
                str(e)
            )

        finally:

            db.close()

    response = RedirectResponse(
        url=FRONTEND_URL,
        status_code=303
    )

    response.delete_cookie(
        key="aiee_session",
        path="/"
    )

    print(
        "Browser session cookie deleted."
    )

    print("=" * 60 + "\n")

    return response