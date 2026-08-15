import os
import secrets
from urllib.parse import urlencode

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse


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


# IMPORTANT:
# Use 127.0.0.1 consistently during local development.
#
# This URL MUST be the same as the callback URL configured
# inside your GitHub OAuth App.
# ============================================================

REDIRECT_URI = os.getenv(
    "GITHUB_REDIRECT_URI"
)

if not REDIRECT_URI:
    REDIRECT_URI = (
        "http://127.0.0.1:8000"
        "/auth/github/callback"
    )


# ============================================================
# FRONTEND URL
# ============================================================

FRONTEND_URL = os.getenv(
    "FRONTEND_URL"
)

if not FRONTEND_URL:
    FRONTEND_URL = (
        "http://127.0.0.1:5173"
    )


# ============================================================
# TEMPORARY LOCAL DEVELOPMENT STORAGE
# ============================================================

# OAuth state
oauth_states = {}


# Session ID -> GitHub user information
github_sessions = {}


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


    # --------------------------------------------------------
    # Validate Client ID
    # --------------------------------------------------------

    if not CLIENT_ID:

        print(
            "ERROR: GITHUB_CLIENT_ID is missing."
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "GITHUB_CLIENT_ID is not configured."
            )

        )


    # --------------------------------------------------------
    # Validate Client Secret
    # --------------------------------------------------------

    if not CLIENT_SECRET:

        print(
            "ERROR: GITHUB_CLIENT_SECRET is missing."
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "GITHUB_CLIENT_SECRET is not configured."
            )

        )


    # --------------------------------------------------------
    # Validate Redirect URI
    # --------------------------------------------------------

    if not REDIRECT_URI:

        raise HTTPException(

            status_code=500,

            detail=(
                "GITHUB_REDIRECT_URI is not configured."
            )

        )


    # --------------------------------------------------------
    # Create OAuth state
    # --------------------------------------------------------

    state = secrets.token_urlsafe(32)

    oauth_states[state] = True


    print(
        "OAuth state created."
    )

    print(
        "Redirect URI:",
        REDIRECT_URI
    )


    # --------------------------------------------------------
    # GitHub OAuth parameters
    # --------------------------------------------------------

    params = {

        "client_id":
            CLIENT_ID,

        "redirect_uri":
            REDIRECT_URI,

        "state":
            state,

        "scope":
            "read:user repo"

    }


    # --------------------------------------------------------
    # Create GitHub authorization URL
    # --------------------------------------------------------

    github_url = (
        "https://github.com/login/oauth/authorize?"
        + urlencode(params)
    )


    print(
        "GitHub OAuth URL generated."
    )

    print(
        "Redirecting user to GitHub..."
    )

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

        print(
            "ERROR: OAuth state missing."
        )

        raise HTTPException(

            status_code=400,

            detail="OAuth state is missing."

        )


    if state not in oauth_states:

        print(
            "ERROR: Invalid OAuth state."
        )

        raise HTTPException(

            status_code=400,

            detail=(
                "Invalid or expired OAuth state."
            )

        )


    # --------------------------------------------------------
    # Remove state after successful validation
    # --------------------------------------------------------

    oauth_states.pop(
        state,
        None
    )


    print(
        "OAuth state validated successfully."
    )


    # --------------------------------------------------------
    # Validate credentials
    # --------------------------------------------------------

    if not CLIENT_ID:

        raise HTTPException(

            status_code=500,

            detail=(
                "GITHUB_CLIENT_ID is not configured."
            )

        )


    if not CLIENT_SECRET:

        raise HTTPException(

            status_code=500,

            detail=(
                "GITHUB_CLIENT_SECRET is not configured."
            )

        )


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

                    "client_id":
                        CLIENT_ID,

                    "client_secret":
                        CLIENT_SECRET,

                    "code":
                        code,

                    "redirect_uri":
                        REDIRECT_URI

                },

                headers={

                    "Accept":
                        "application/json"

                }

            )

    except Exception as e:

        print(
            "GitHub token request failed:",
            str(e)
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Could not connect to GitHub."
            )

        )


    # --------------------------------------------------------
    # Check token response
    # --------------------------------------------------------

    if token_response.status_code != 200:

        print(
            "GitHub token exchange failed."
        )

        print(
            "Status:",
            token_response.status_code
        )

        print(
            "Response:",
            token_response.text
        )

        raise HTTPException(

            status_code=400,

            detail=(
                "GitHub token exchange failed."
            )

        )


    token_data = (
        token_response.json()
    )


    print(
        "GitHub token response received."
    )


    # --------------------------------------------------------
    # Get access token
    # --------------------------------------------------------

    access_token = (
        token_data.get(
            "access_token"
        )
    )


    if not access_token:

        print(
            "GitHub token was not received."
        )

        print(
            "Token response:",
            token_data
        )

        raise HTTPException(

            status_code=400,

            detail=(
                token_data.get(
                    "error_description"
                )
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
                        "2022-11-28"

                }

            )

    except Exception as e:

        print(
            "GitHub user request failed:",
            str(e)
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Could not retrieve GitHub user."
            )

        )


    # --------------------------------------------------------
    # Check GitHub user response
    # --------------------------------------------------------

    if user_response.status_code != 200:

        print(
            "GitHub user request failed."
        )

        print(
            "Status:",
            user_response.status_code
        )

        print(
            "Response:",
            user_response.text
        )

        raise HTTPException(

            status_code=400,

            detail=(
                "Could not retrieve GitHub user."
            )

        )


    user = user_response.json()


    username = user.get(
        "login"
    )

    name = user.get(
        "name"
    )


    if not username:

        raise HTTPException(

            status_code=400,

            detail=(
                "GitHub username could not be determined."
            )

        )


    print(
        "GitHub user:",
        username
    )


    # ========================================================
    # CREATE AIEE SESSION
    # ========================================================

    session_id = secrets.token_urlsafe(32)


    github_sessions[session_id] = {

        "access_token":
            access_token,

        "username":
            username,

        "name":
            name or username

    }


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
        "Session ID:",
        session_id
    )

    print(
        "Active sessions:",
        len(github_sessions)
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
    # CREATE SESSION COOKIE
    # ========================================================

    response.set_cookie(

        key="aiee_session",

        value=session_id,

        httponly=True,

        samesite="lax",

        secure=False,

        max_age=3600,

        path="/"

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

    print(
        "Session ID:",
        session_id
    )


    # --------------------------------------------------------
    # No cookie
    # --------------------------------------------------------

    if not session_id:

        print(
            "RESULT: NOT AUTHENTICATED"
        )

        print("=" * 60)

        return {

            "authenticated":
                False,

            "github_user":
                None,

            "name":
                None

        }


    # --------------------------------------------------------
    # Find session
    # --------------------------------------------------------

    session = github_sessions.get(
        session_id
    )


    if not session:

        print(
            "RESULT: SESSION NOT FOUND"
        )

        print("=" * 60)

        return {

            "authenticated":
                False,

            "github_user":
                None,

            "name":
                None

        }


    # --------------------------------------------------------
    # Authenticated
    # --------------------------------------------------------

    print(
        "RESULT: AUTHENTICATED"
    )

    print(
        "GitHub user:",
        session.get("username")
    )

    print("=" * 60)


    return {

        "authenticated":
            True,

        "github_user":
            session.get(
                "username"
            ),

        "name":
            session.get(
                "name"
            )

    }


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
        "Session received:",
        session_id
    )


    # --------------------------------------------------------
    # Remove server-side session
    # --------------------------------------------------------

    if session_id:

        github_sessions.pop(
            session_id,
            None
        )

        print(
            "Server-side session removed."
        )


    # --------------------------------------------------------
    # Redirect to frontend
    # --------------------------------------------------------

    response = RedirectResponse(

        url=FRONTEND_URL,

        status_code=303

    )


    # --------------------------------------------------------
    # Delete cookie
    # --------------------------------------------------------

    response.delete_cookie(

        key="aiee_session",

        path="/"

    )


    print(
        "Browser session cookie deleted."
    )

    print("=" * 60 + "\n")


    return response