import subprocess
import json

def schat():
    history = []
    while True:
        user_input = input()
        result = subprocess.run(
            ["ollama", "run", "gemma3:4b"],
            input=user_input.encode("utf-8"),
            capture_output=True
        )

        output = result.stdout.decode("utf-8").strip()
        cleaned = output.lstrip()

        entry = {
            "role": "user",
            "text": user_input
        }
        history.append(entry)
        entry = {
            "role": "gemma",
            "text": cleaned
        }
        history.append(entry)

        print(cleaned)

        with open("chat_history.json", "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    schat()