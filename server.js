import express from "express";
import cors from "cors";
import { createServer } from "http";
import initSocket from "./socket.js";

import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import messageUploadRoutes from "./routes/messageUpload.routes.js";
import uploadImageRoute from "./routes/uploadImage.routes.js";

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/upload-avatar", uploadRoutes);
app.use("/api/upload-message", messageUploadRoutes);
app.use("/api/upload-image", uploadImageRoute);

app.get("/", (req, res) => {
  res.json({ message: "Backend running..." });
});

initSocket(httpServer);

export default httpServer;