import { Server } from "socket.io";
import handleChatMessages from "../controllers/chatController";
export default function initializeChatNamespace(server) {
    const chatServer = new Server(server);
    const chatNamespace = chatServer.of("/chat");
    chatNamespace.on("connection", (socket) => {
        console.log("Użytkownik połączony do /chat:", socket.id);
        handleChatMessages(socket);
        socket.on("disconnect", () => {
            console.log("Użytkownik rozłączony z /chat:", socket.id);
        });
    });
}
