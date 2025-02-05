import React, { useState, useEffect } from "react";
import { sendMessageToChatGPT } from "../api/chatgpt";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Envoyer un message au chatbot dès le chargement
    const fetchInitialMessage = async () => {
      const firstMessage = "Démarre la conversation avec l'utilisateur.";
      const response = await sendMessageToChatGPT([
        { role: "user", content: firstMessage },
      ]);
      setMessages([{ role: "assistant", content: response }]);
    };

    fetchInitialMessage();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);

    const response = await sendMessageToChatGPT(newMessages);
    setMessages([...newMessages, { role: "assistant", content: response }]);
    setInput("");
  };

  return (
    <div className="chatbot-container">
      <div className="chatbox">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.role === "user" ? "user-message" : "assistant-message"
            }`}
          >
            <strong>{msg.role === "user" ? "Toi" : "Assistant LunAR"}:</strong>{" "}
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
        />
        <button onClick={handleSendMessage} className="button">
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
