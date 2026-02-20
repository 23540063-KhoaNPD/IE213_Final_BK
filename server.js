import express from "express";
import cors from "cors";
import { createServer } from "http";
import initSocket from "./socket.js";

import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/upload-avatar", uploadRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend running..." });
});

initSocket(httpServer);

export default httpServer;