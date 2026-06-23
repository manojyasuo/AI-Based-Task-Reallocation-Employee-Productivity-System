import React, { useState } from "react";

const ChatBot = ({ role, tasks }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 Ask me about tasks, deadlines, or status!" }
  ]);
  const [input, setInput] = useState("");

  // 🔥 CORE LOGIC
  const getBotResponse = (msg) => {
    const text = msg.toLowerCase();

    // ADMIN COMMANDS
    if (role === "ADMIN") {
      if (text.includes("all tasks")) {
        return `Total tasks: ${tasks.length}`;
      }

      if (text.includes("pending")) {
        const pending = tasks.filter(t => t.status === "PENDING");
        return `Pending tasks: ${pending.length}`;
      }

      if (text.includes("overdue")) {
        const overdue = tasks.filter(t =>
          t.deadline && new Date(t.deadline) < new Date()
        );
        return `Overdue tasks: ${overdue.length}`;
      }
    }

    // EMPLOYEE COMMANDS
    if (role === "EMPLOYEE") {
      if (text.includes("my tasks")) {
        return `You have ${tasks.length} tasks assigned`;
      }

      if (text.includes("progress")) {
        const progress = tasks.filter(t => t.status === "IN_PROGRESS");
        return `Tasks in progress: ${progress.length}`;
      }

      if (text.includes("deadline")) {
        return "Check your calendar for deadlines 📅";
      }
    }

    return "Try: 'my tasks', 'pending tasks', 'overdue tasks'";
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    const botMsg = { sender: "bot", text: getBotResponse(input) };

    setMessages([...messages, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      width: 320,
      background: "#020617",
      borderRadius: 15,
      padding: 12,
      color: "white",
      boxShadow: "0 0 20px rgba(0,0,0,0.5)"
    }}>
      <div style={{ maxHeight: 250, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "6px 0" }}>
            <b>{m.sender === "bot" ? "🤖" : "👤"}:</b> {m.text}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          style={{ flex: 1, padding: 6 }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;