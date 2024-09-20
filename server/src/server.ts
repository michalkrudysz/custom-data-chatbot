import express from "express";
import http from "http";
import initializeChatNamespace from "./routes/chat";

const app = express();
const server = http.createServer(app);

app.use(express.json());

initializeChatNamespace(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
