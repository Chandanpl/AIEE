from scripts.repository_history import detect_repository_history

TOKEN = "PASTE_YOUR_GITHUB_TOKEN_HERE"

result = detect_repository_history(
    "Chandanpl/PilotWatch",
    TOKEN,
    max_commits=100
)

print(result)