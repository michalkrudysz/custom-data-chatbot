import cors from "cors";
const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
};
export const corsMiddleware = (req, res, next) => {
    cors(corsOptions)(req, res, next);
};
