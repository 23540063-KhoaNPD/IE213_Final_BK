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

      const newMessage = await MessageController.addItem({
        roomId: roomId,
        userId: socket.userId,
        content: message,
        type: "Text"
      });

      io.to(roomId).emit("receive_msg", newMessage);
    });

    socket.on("image_msg", async (message) => {
      io.to(message.Room_id.toString()).emit("receive_msg", message);
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

    /* UPDATE MESSAGE */
    socket.on("update_message", async ({ messageId, newContent, roomId }) => {

      if (!ObjectId.isValid(messageId)) return;
      if (!ObjectId.isValid(roomId)) return;
      if (!newContent || !newContent.trim()) return;

      // Lấy message hiện tại
      const message = await MessageController.findById(messageId);
      if (!message) return;

      // Chỉ cho phép chủ tin nhắn sửa
      if (String(message.Sender_id) !== String(socket.userId)) return;

      // Update DB
      socket.on("update_message", async ({ messageId, newContent, roomId }) => {

        const updatedMessage = await MessageController.updateItem({
          messageId,
          newContent
        });

        if (!updatedMessage) return;

        io.to(roomId).emit("message_updated", updatedMessage);
      });

      // Lấy lại message sau khi update
      const updatedMessage = await MessageController.findById(messageId);

      io.to(roomId).emit("message_updated", updatedMessage);
    });


    /* DELETE MESSAGE */
    socket.on("delete_message", async ({ messageId, roomId }) => {

      const message = await MessageController.findById(messageId);
      if (!message) return;

      if (String(message.Sender_id) !== String(socket.userId)) return;

      await MessageController.deleteItem(messageId);

      io.to(roomId).emit("message_deleted", { messageId });
    });


  });
}