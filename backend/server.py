import os
from pathlib import Path
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str

HISTORY_DIR = Path("chat_history")
HISTORY_DIR.mkdir(exist_ok=True)
os.makedirs(HISTORY_DIR, exist_ok=True)

current_chat = []
current_file = None

def get_next_history_path():
    """Get next available chat history filename"""
    existing = [
        int(f.split("_")[-1].split(".")[0])
        for f in os.listdir(HISTORY_DIR)
        if f.startswith("chat_history_") and f.endswith(".md")
    ]
    next_id = max(existing) + 1 if existing else 1
    return os.path.join(HISTORY_DIR, f"chat_history_{next_id}.md")


@app.post("/chat")
def chat(msg: Message):
    global current_chat, current_file

    user_text = msg.message.strip()
    if not user_text:
        return {"reply": "⚠️ Empty message."}

    # Call Ollama
    result = subprocess.run(
        ["ollama", "run", "gemma3:4b"],
        input=user_text.encode("utf-8"),
        capture_output=True,
    )
    reply = result.stdout.decode("utf-8").strip()

    current_chat.append({"role": "user", "text": user_text})
    current_chat.append({"role": "assistant", "text": reply})

    if not current_file:
        current_file = get_next_history_path()

    # Save as Markdown
    with open(current_file, "w", encoding="utf-8") as f:
        for msg in current_chat:
            if msg["role"] == "user":
                f.write(f"**User:** {msg['text']}\n\n")
            else:
                f.write(f"**Assistant:**\n{msg['text']}\n\n---\n\n")

    return {"reply": reply}


@app.get("/history")
def list_histories():
    """List all saved markdown chat files"""
    files = sorted(os.listdir(HISTORY_DIR))
    return {"histories": files}


@app.get("/history/{filename}")
def get_history(filename: str):
    """Load markdown content as a string"""
    path = os.path.join(HISTORY_DIR, filename)
    if not os.path.exists(path):
        return {"error": "File not found"}
    with open(path, "r", encoding="utf-8") as f:
        return {"content": f.read()}
    
@app.post("/new_chat")
async def new_chat():
    # Count existing chat files
    files = list(HISTORY_DIR.glob("chat_history_*.md"))
    new_id = len(files) + 1
    new_file = HISTORY_DIR / f"chat_history_{new_id}.md"

    # Create new empty chat
    new_file.write_text("# New Chat\n\n")

    return {"chat_id": new_id, "filename": new_file.name}


@app.delete("/history/{filename}")
def delete_history(filename: str):
    path = os.path.join(HISTORY_DIR, filename)
    if os.path.exists(path):
        os.remove(path)
        return {"message": f"{filename} deleted"}
    return {"error": "File not found"}
