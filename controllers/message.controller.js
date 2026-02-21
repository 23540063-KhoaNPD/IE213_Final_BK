import MessageDAO from "../dao/message.dao.js";
import UserDAO from "../dao/user.dao.js";
import { ObjectId } from "mongodb";
import MessageDeletedDAO from "../dao/messageDeleted.dao.js";

export default class MessageController {

  static async addItem({ roomId, userId, content, type = "Text" }) {

    const user = await UserDAO.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const messageData = {
      Room_id: new ObjectId(roomId),
      Sender_id: new ObjectId(userId),
      Sender_name: user.Username,
      Sender_avatar: user.Avatar,
      Content: content,
      Type: type,
      Timestamp: new Date(),
      Edited: false,
      Deleted: false
    };

    const message = await MessageDAO.create(messageData);

    return message;
  }

  static async getByRoom(roomId) {
    return await MessageDAO.getByRoom(roomId);
  }

  /* ================= NEW ================= */

  static async findById(messageId) {
    if (!ObjectId.isValid(messageId)) return null;
    return await MessageDAO.findById(new ObjectId(messageId));
  }

  static async updateItem({ messageId, newContent }) {

    if (!ObjectId.isValid(messageId)) return null;

    await MessageDAO.update(messageId, {
      Content: newContent,
      Edited: true
    });

    const updatedMessage = await MessageDAO.findById(messageId);

    return updatedMessage;
  }

  static async deleteItem(messageId) {

    if (!ObjectId.isValid(messageId)) return;

    // 1️⃣ Tìm message
    const message = await MessageDAO.findById(messageId);
    if (!message) return;

    // 2️⃣ Insert sang collection msg_deleted
    await MessageDeletedDAO.create(message);

    // 3️⃣ Xoá khỏi collection message
    await MessageDAO.delete(messageId);

    return true;
  }
}