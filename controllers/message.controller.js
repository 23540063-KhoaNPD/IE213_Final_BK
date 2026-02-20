import MessageDAO from "../dao/message.dao.js";
import UserDAO from "../dao/user.dao.js";
import { ObjectId } from "mongodb";

export default class MessageController {

  static async addItem({ roomId, userId, content, type = "Text" }) {

    // 1️⃣ Lấy thông tin user
    const user = await UserDAO.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // 2️⃣ Tạo message đầy đủ
    const messageData = {
      Room_id: new ObjectId(roomId),   // 👈 ép về ObjectId
      Sender_id: new ObjectId(userId),
      Sender_name: user.Username,
      Sender_avatar: user.Avatar,
      Content: content,
      Type: type,
      Timestamp: new Date()
    };

    // 3️⃣ Lưu DB
    const message = await MessageDAO.create(messageData);

    return message;
  }

  static async getByRoom(roomId) {
    return await MessageDAO.getByRoom(roomId);
  }
}