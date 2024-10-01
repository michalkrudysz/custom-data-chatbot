import { useState, useEffect, useRef } from "react";
import { chatService, ChatMessage } from "../api/client";
import classes from "./Chat.module.scss";
import sendIcon from "../assets/send_icon.svg";

type ExtendedChatMessage = ChatMessage & {
  isTyping?: boolean;
};

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ExtendedChatMessage[]>([]);

  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResponse = (data: string) => {
      setChatMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const typingMessageIndex = updatedMessages.findIndex(
          (msg) => msg.isTyping === true
        );

        if (typingMessageIndex !== -1) {
          updatedMessages[typingMessageIndex] = {
            sender: "server",
            message: data,
          };
        } else {
          updatedMessages.push({ sender: "server", message: data });
        }

        return updatedMessages;
      });
    };

    const handleConnectError = (error: Error) => {
      console.error("Błąd połączenia:", error);
    };

    chatService.connect(handleResponse, handleConnectError);

    return () => {
      chatService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      chatService.sendMessage(message);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", message },
        { sender: "server", message: "", isTyping: true },
      ]);
      setMessage("");
    }
  };

  return (
    <div className={classes.chat}>
      <div className={classes["chat-header"]}>Przetestuj działanie chatu</div>
      <div className={classes["chat-history"]} ref={chatHistoryRef}>
        {chatMessages.map((chatMessage, index) => (
          <div
            key={index}
            className={`${classes.message} ${
              chatMessage.sender === "user"
                ? classes["user-message"]
                : classes["server-message"]
            }`}
          >
            <div className={classes["sender-name"]}>
              {chatMessage.sender === "user"
                ? "Użytkownik"
                : "Pocketinspections"}
            </div>
            <div className={classes["message-text"]}>
              {chatMessage.isTyping ? (
                <div className={classes["typing-indicator"]}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                chatMessage.message
              )}
            </div>
          </div>
        ))}
      </div>
      <div className={classes["chat-input"]}>
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
        <button onClick={handleSendMessage}>
          <img src={sendIcon} alt="Ikona wysyłania" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
