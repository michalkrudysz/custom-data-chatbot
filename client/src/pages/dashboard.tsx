import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

type ChatMessage = {
  sender: string;
  message: string;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const newSocket: Socket = io("ws://localhost:3000/chat", {
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    setSocket(newSocket);
    newSocket.on("response", (data: string) => {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: "server", message: data },
      ]);
    });
    newSocket.on("connect_error", (error: Error) => {
      console.error("Błąd połączenia:", error);
    });
    return () => {
      newSocket.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (socket && message.trim() !== "") {
      socket.emit("message", message);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", message },
      ]);
      setMessage("");
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Wyloguj</button>

      <div className="chat">
        <h2>Chat</h2>
        <div className="chat-history">
          {chatMessages.map((chatMessage, index) => (
            <div
              key={index}
              className={`message ${
                chatMessage.sender === "user"
                  ? "user-message"
                  : "server-message"
              }`}
            >
              {chatMessage.sender === "user"
                ? "Użytkownik"
                : "Pocketinspections"}
              :{chatMessage.message}
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
    </div>
  );
}
