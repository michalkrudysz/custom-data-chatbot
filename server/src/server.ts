import express from "express";
import http from "http";
import initializeChatNamespace from "./routes/chat";
import authorizationRoutes from "./routes/authorization";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use("/auth", authorizationRoutes);

initializeChatNamespace(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
