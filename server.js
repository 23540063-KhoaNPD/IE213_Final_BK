import express from "express";
import cors from "cors";
import { createServer } from "http";
import initSocket from "./socket.js";

import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import messageUploadRoutes from "./routes/messageUpload.routes.js";
import uploadImageRoute from "./routes/uploadImage.routes.js";
import uploadRoomBgRoute from "./routes/uploadRoomBg.routes.js";

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  `${process.env.FRONTEND_URL}`
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // cho Postman
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("Not allowed by CORS"), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.use("/api/users", userRoutes);
app.use("/api/upload-avatar", uploadRoutes);
app.use("/api/upload-message", messageUploadRoutes);
app.use("/api/upload-image", uploadImageRoute);
app.use("/api/upload-room-bg", uploadRoomBgRoute);

app.get("/", (req, res) => {
  res.json({ message: "Backend running..." });
});

initSocket(httpServer);

export default httpServer;