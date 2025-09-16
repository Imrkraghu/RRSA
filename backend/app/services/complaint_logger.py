import json
import os
from datetime import datetime

LOG_PATH = "logs/complaints.json"

def log_complaint(data: dict):
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)

    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        **data
    }

    # Append to JSON log
    if os.path.exists(LOG_PATH):
        with open(LOG_PATH, "r+") as f:
            existing = json.load(f)
            existing.append(entry)
            f.seek(0)
            json.dump(existing, f, indent=2)
    else:
        with open(LOG_PATH, "w") as f:
            json.dump([entry], f, indent=2)
