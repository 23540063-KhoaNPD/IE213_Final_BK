import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

import RoomController from "./controllers/room.controller.js";
import MessageController from "./controllers/message.controller.js";
import UserController from "./controllers/user.controller.js";

export default function initSocket(httpServer) {

  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const decoded = jwt.verify(token, process.env.JWTKEY);

      socket.userId = decoded.userId;
      socket.join(socket.userId.toString());

      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {

    console.log("User connected:", socket.userId);

    /* SEND MY PROFILE */
    (async () => {
      const user = await UserController.findById(socket.userId);

      socket.emit("my_profile", {
        userId: user?._id,
        username: user?.Username,
        avatar: user?.Avatar
      });
    })();

    /* LOAD ROOMS */
    socket.on("get_rooms", async () => {
      const rooms = await RoomController.getAllItem();
      socket.emit("room_list", rooms);
    });

    /* JOIN ROOM */
    socket.on("join_room", async (roomId) => {
      if (!ObjectId.isValid(roomId)) return;

      socket.join(roomId);

      const history = await MessageController.getByRoom(roomId);

      const fullHistory = await Promise.all(
        history.map(async msg => {
          const user = await UserController.findById(msg.Sender_id);
          return {
            ...msg,
            Sender_name: user?.Username,
            Sender_avatar: user?.Avatar
          };
        })
      );

      socket.emit("chat_history", fullHistory);
    });

    /* SEND MESSAGE */
    socket.on("send_msg", async ({ roomId, message }) => {

      if (!ObjectId.isValid(roomId)) return;
      if (!message) return;

      const saved = await MessageController.addItem({
        Room_id: new ObjectId(roomId),
        Sender_id: new ObjectId(socket.userId),
        Content: message,
        Timestamp: new Date(),
        Type: "Text"
      });

      const user = await UserController.findById(socket.userId);

      io.to(roomId).emit("receive_msg", {
        ...saved,
        Sender_name: user?.Username,
        Sender_avatar: user?.Avatar
      });
    });

    /* CREATE ROOM */
    socket.on("create_room", async ({ roomName }) => {

      if (!roomName || !roomName.trim()) return;

      await RoomController.addItem({
        room_name: roomName.trim(),
        creator: socket.userId
      });

      const rooms = await RoomController.getAllItem();
      io.emit("room_list", rooms);
    });

    /* UPDATE ROOM */
    socket.on("update_room", async ({ roomId, newName }) => {

      if (!ObjectId.isValid(roomId)) return;
      if (!newName || !newName.trim()) return;

      await RoomController.updateItem({
        _id: roomId,
        Room_name: newName.trim()
      });

      const rooms = await RoomController.getAllItem();
      io.emit("room_list", rooms);
    });

    /* DELETE ROOM */
    socket.on("delete_room", async ({ roomId }) => {

      if (!ObjectId.isValid(roomId)) return;

      await RoomController.deleteItem(roomId);

      const rooms = await RoomController.getAllItem();
      io.emit("room_list", rooms);
    });

  });
}