# local_chat

ChatUI for local work powered by **Ollama** running the [`gemma3:4b`](https://ollama.com/library/gemma3:4b) model.  

## Stack
| Layer | Technology |
|--------|-------------|
| **Frontend** | React + Vite + TailwindCSS + Framer Motion |
| **Backend** | FastAPI (Python) |
| **AI Model** | Ollama — [`gemma3:4b`](https://ollama.com/library/gemma3:4b) |
| **Markdown Support** | react-markdown + remark-gfm |
| **Storage** | Local filesystem (`chat_history/*.md`) |


## Backend Routes
| Method   | Endpoint              | Description                          |
| -------- | --------------------- | ------------------------------------ |
| `GET`    | `/history`            | List all saved chat files            |
| `GET`    | `/history/{filename}` | Get content of a chat                |
| `POST`   | `/chat`               | Send a new message (echo simulation) |
| `POST`   | `/new_chat`           | Create a new empty chat              |
| `DELETE` | `/history/{filename}` | Delete a chat file                   |


## Setup
### Backend
```
python -m venv venv

source venv/bin/activate  # or venv\Scripts\activate
```

```
pip install -r backend/requirements.txt
```

Run backend:
```
uvicorn server:app --reload --port 8000
```

### Frontend
```
cd ../frontend
# install dependecies
npm install
# run dev server
npm run dev
```