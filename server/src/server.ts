import express from "express";
import http from "http";
import initializeChatNamespace from "./routes/chat";
import authorizationRoutes from "./routes/authorization";
import dashboardRoutes from "./routes/dashboard";
import dotenv from "dotenv";
import { authMiddleware } from "./middleware/authMiddleware";
import { corsMiddleware } from "./middleware/corsMiddleware";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(corsMiddleware);

app.use("/auth", authorizationRoutes);
app.use("/dashboard", authMiddleware, dashboardRoutes);
initializeChatNamespace(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
