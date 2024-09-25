import { useState, useEffect } from "react";
import { chatService, ChatMessage } from "../api/client";

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const handleResponse = (data: string) => {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: "server", message: data },
      ]);
    };

    const handleConnectError = (error: Error) => {
      console.error("Błąd połączenia:", error);
    };

    chatService.connect(handleResponse, handleConnectError);

    return () => {
      chatService.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      chatService.sendMessage(message);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", message },
      ]);
      setMessage("");
    }
  };

  return (
    <div className="chat">
      <h2>Chat</h2>
      <div className="chat-history">
        {chatMessages.map((chatMessage, index) => (
          <div
            key={index}
            className={`message ${
              chatMessage.sender === "user" ? "user-message" : "server-message"
            }`}
          >
            {chatMessage.sender === "user" ? "Użytkownik" : "Pocketinspections"}
            : {chatMessage.message}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Wpisz swoją wiadomość..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage}>Wyślij</button>
      </div>
    </div>
  );
};

export default Chat;
