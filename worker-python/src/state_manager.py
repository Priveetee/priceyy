import json
import os

CACHE_DIR = "/app/cache"
STATE_FILE = os.path.join(CACHE_DIR, "ingestion_state.json")


def load_state():
    if not os.path.exists(STATE_FILE):
        return {}
    try:
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}


def save_state(state):
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)
