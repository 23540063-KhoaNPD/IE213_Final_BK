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
    socket.join(socket.userId);

    /* GET USERS */
    socket.on("get_users", async () => {

      const users = await UserController.getAllUsers();

      socket.emit("user_list", users);

    });

    /* FIND USER BY EMAIL */
    socket.on("find_user_by_email", async ({ email }) => {

      if (!email) return;

      const user = await UserController.findByEmail(email);

      if (!user) {
        socket.emit("user_not_found");
        return;
      }

      // Không cho tìm chính mình
      if (String(user._id) === String(socket.userId)) {
        socket.emit("user_not_found");
        return;
      }

      socket.emit("user_found", {
        _id: user._id,
        Username: user.Username,
        Email: user.Email
      });

    });

    /* SEND MY PROFILE */
    (async () => {
      const user = await UserController.findById(socket.userId);

      socket.emit("my_profile", {
        userId: user?._id,
        username: user?.Username,
        avatar: user?.Avatar
      });
    })();

    socket.on("create_direct_room", async ({ targetUserId }) => {

      if (!targetUserId) return;

      const existingRoom = await RoomController.findDirectRoom(
        socket.userId,
        targetUserId
      );

      // 🔥 Nếu đã tồn tại → join luôn
      if (existingRoom) {
        socket.emit("direct_room_ready", existingRoom);
        return;
      }

      // 🔥 Nếu chưa tồn tại → tạo mới
      const result = await RoomController.addItem({
        Room_name: null,
        creator: socket.userId,
        isPrivate: true,
        isDirect: true,
        members: [socket.userId, targetUserId]
      });

      const newRoom = await RoomController.getById(result.insertedId);

      socket.emit("direct_room_ready", newRoom);
      io.to(targetUserId).emit("room_created", newRoom);

    });

    /* LOAD ROOMS */
    socket.on("get_rooms", async () => {

      const rooms = await RoomController.getRoomsForUser(socket.userId);

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

      io.to(roomId).emit("receive_msg", {
        ...newMessage,
        _id: newMessage._id.toString(),
        Room_id: roomId.toString(), // 🔥 BẮT BUỘC
        Sender_id: socket.userId.toString()
      });

    });

    socket.on("image_msg", async (message) => {
      io.to(message.Room_id.toString()).emit("receive_msg", message);
    });

    /* CREATE ROOM */
    socket.on("create_room", async ({ roomName, isPrivate, targetUserId }) => {

      // console.log("CREATE ROOM DATA:", {
      //   roomName,
      //   isPrivate,
      //   targetUserId
      // });

      if (!roomName || !roomName.trim()) return;

      let members = [];

      if (isPrivate && targetUserId) {
        members = [
          new ObjectId(socket.userId),
          new ObjectId(targetUserId)
        ];
      }

      const result = await RoomController.addItem({
        Room_name: roomName.trim(),
        creator: new ObjectId(socket.userId),
        isPrivate: isPrivate || false,
        members
      });

      const newRoom = await RoomController.getById(result.insertedId);

      if (isPrivate) {
        socket.emit("room_created", newRoom);
        io.to(targetUserId.toString()).emit("room_created", newRoom);
      } else {
        io.emit("room_created", newRoom);
      }

    });

    /* UPDATE ROOM */
    socket.on("update_room", async ({ roomId, newName, newBackground }) => {

      if (!ObjectId.isValid(roomId)) return;
      if (!newName || !newName.trim()) return;

      await RoomController.updateItem({
        _id: roomId,
        Room_name: newName.trim(),
        room_bg: newBackground
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

      const message = await MessageController.findById(messageId);
      if (!message) return;

      // Chỉ cho phép chủ tin nhắn sửa
      if (String(message.Sender_id) !== String(socket.userId)) return;

      const updatedMessage = await MessageController.updateItem({
        messageId,
        newContent
      });

      if (!updatedMessage) return;

      const user = await UserController.findById(message.Sender_id);

      io.to(roomId).emit("message_updated", {
        ...updatedMessage,
        _id: updatedMessage._id.toString(),  // 🔥 QUAN TRỌNG
        Sender_id: updatedMessage.Sender_id.toString(),
        Room_id: updatedMessage.Room_id.toString(),
        Sender_name: user?.Username,
        Sender_avatar: user?.Avatar
      });
    });

    /* DELETE MESSAGE */
    socket.on("delete_message", async ({ messageId, roomId }) => {

      const message = await MessageController.findById(messageId);
      if (!message) return;

      if (String(message.Sender_id) !== String(socket.userId)) return;

      await MessageController.deleteItem(messageId);

      io.to(roomId).emit("message_deleted", { messageId });
    });

    /* UPDATE NAME */
    socket.on("update_name", async ({ name }) => {

      if (!name || !name.trim()) return;

      if (!ObjectId.isValid(socket.userId)) return;

      await UserController.updateNameById(
        new ObjectId(socket.userId),
        name.trim()
      );

      io.emit("name_updated", {
        userId: socket.userId.toString(),
        name: name.trim()
      });
    });

  });
}