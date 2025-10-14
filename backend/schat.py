import subprocess
import json
import os

def schat():
    history = []
    while True:
        user_input = input("You: ")
        if user_input.lower() in {"exit", "quit"}:
            break

        result = subprocess.run(
            ["ollama", "run", "gemma3:4b"],
            input=user_input.encode("utf-8"),
            capture_output=True
        )
        output = result.stdout.decode("utf-8").strip()
        print(f"Gemma: {output}")
        history.append({"role": "user", "text": user_input})
        history.append({"role": "gemma", "text": output})

if __name__ == "__main__":
    schat()
