import RoomDAO from "../dao/room.dao.js";
import { ObjectId } from "mongodb";

export default class RoomController {

  static async getAllItem() {
    return await RoomDAO.getAll();
  }

  static async addItem(data) {
    return await RoomDAO.create({
      Room_name: data.Room_name,
      Creator: data.creator,
      isPrivate: data.isPrivate || false,
      members: data.members || [],
      room_bg: data.room_bg || "#0084ff",
      Created_at: new Date()
    });
  }
  static async deleteItem(roomId) {
    return await RoomDAO.delete(roomId);
  }

  static async updateItem(data) {
    const { _id, ...updateData } = data;
    return await RoomDAO.update(_id, updateData);
  }

  static async getById(id) {
    return await RoomDAO.getById(id);
  }

  static async findDirectRoom(userA, userB) {
    return await RoomDAO.findDirectRoom(userA, userB);
  }

  static async getRoomsForUser(userId) {
    return await RoomDAO.find({
      $or: [
        { isPrivate: { $ne: true } }, // room public hoặc chưa có field
        { members: new ObjectId(userId) }
      ]
    });
  }

}