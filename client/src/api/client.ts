import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import { io, Socket } from "socket.io-client";

const BASE_URL = "http://localhost:3000";
const TIMEOUT = 10000;

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => Promise.reject(error)
);

export type ChatMessage = {
  sender: string;
  message: string;
};

class ChatService {
  private socket: Socket | null = null;

  connect(
    onResponse: (data: string) => void,
    onConnectError: (error: Error) => void
  ) {
    this.socket = io(`${BASE_URL}/chat`, {
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    this.socket.on("response", onResponse);

    this.socket.on("connect_error", onConnectError);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message: string) {
    if (this.socket && message.trim() !== "") {
      this.socket.emit("message", message);
    }
  }
}

const chatService = new ChatService();

export default apiClient;

export { chatService };
