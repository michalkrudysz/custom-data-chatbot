import chatService from "./services/chatService";

const runChatService = async () => {
  try {
    await chatService();
    console.log("Proces czatu zakończony.");
  } catch (error) {
    console.error("Błąd w procesie czatu:", error);
  }
};

runChatService();
