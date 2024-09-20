import { Socket } from "socket.io";
import chatService from "../services/chatService";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

type ChatHistory = {
  [socketId: string]: Array<HumanMessage | AIMessage>;
};

const chatHistory: ChatHistory = {};

const handleChatMessages = (socket: Socket) => {
  console.log("Nowe połączenie:", socket.id);

  chatHistory[socket.id] = [];

  socket.on("message", async (question: string) => {
    console.log(`Otrzymano pytanie od ${socket.id}: ${question}`);
    try {
      const userChatHistory = chatHistory[socket.id];
      const response = await chatService({
        question,
        chat_history: userChatHistory,
      });
      userChatHistory.push(new HumanMessage(question));
      userChatHistory.push(new AIMessage(response));
      socket.emit("response", response);
      console.log(`Wysłano odpowiedź do ${socket.id}: ${response}`);
    } catch (error) {
      console.error("Błąd podczas obsługi wiadomości:", error);
      socket.emit(
        "error",
        "Wystąpił błąd podczas przetwarzania Twojego pytania."
      );
    }
  });

  socket.on("disconnect", () => {
    console.log("Użytkownik rozłączony:", socket.id);
    delete chatHistory[socket.id];
  });
};

export default handleChatMessages;
