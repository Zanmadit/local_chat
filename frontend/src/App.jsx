import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [histories, setHistories] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // 🔹 Fetch all chat histories
  const fetchHistories = async () => {
    const res = await fetch("http://localhost:8000/history");
    const data = await res.json();
    setHistories(data.histories || []);
  };

  // 🔹 Load a specific chat file
  const loadHistory = async (filename) => {
    const res = await fetch(`http://localhost:8000/history/${filename}`);
    const data = await res.json();
    if (data.content) {
      const blocks = data.content
        .split(/\n---\n/)
        .map((block) => ({ text: block.trim(), role: "assistant" }));
      setMessages(blocks);
    }
    setSelectedHistory(filename);
  };

  // 🔹 Send a message to backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    const resp = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await resp.json();
    const updated = [
      ...newMessages,
      { role: "assistant", text: data.reply || "⚠️ Error" },
    ];
    setMessages(updated);
    fetchHistories();
  };

  // 🔹 Start a new chat
  const startNewChat = async () => {
    try {
      const res = await fetch("http://localhost:8000/new_chat", {
        method: "POST",
      });
      const data = await res.json();
      console.log("New chat started:", data);

      // reset UI
      setMessages([]);
      setSelectedHistory(null);

      // refresh history list
      fetchHistories();
    } catch (err) {
      console.error("Error creating new chat:", err);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, []);

  // --- UI ---
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-700 bg-black/40 p-4 space-y-2 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-2">💬 Chat History</h2>

        {/* ➕ New Chat Button */}
        <button
          onClick={startNewChat}
          className="w-full px-3 py-2 mb-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-medium"
        >
          + New Chat
        </button>

        {histories.length === 0 ? (
          <p className="text-gray-400 text-sm">No saved chats yet</p>
        ) : (
          histories.map((h) => (
            <div
              key={h}
              className="relative group"
            >
              <button
                onClick={() => loadHistory(h)}
                className={`block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition ${
                  selectedHistory === h ? "bg-gray-700" : ""
                }`}
              >
                {h.replace(".md", "")}
              </button>

              {/* 🗑️ Delete button (visible on hover) */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await fetch(`http://localhost:8000/history/${h}`, {
                    method: "DELETE",
                  });
                  fetchHistories();
                  if (selectedHistory === h) setMessages([]);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition"
                title="Delete chat"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`max-w-2xl p-4 rounded-2xl shadow-lg ${
                msg.role === "user"
                  ? "bg-indigo-600 ml-auto text-white"
                  : "bg-gray-800 text-gray-100"
              }`}
            >
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text || ""}
                </ReactMarkdown>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700 bg-black/60">
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-2 rounded-xl bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message with Markdown..."
            />
            <button
              onClick={sendMessage}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:from-indigo-600 hover:to-purple-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
