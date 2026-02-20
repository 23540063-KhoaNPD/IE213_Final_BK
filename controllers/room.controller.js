import RoomDAO from "../dao/room.dao.js";

export default class RoomController {

  static async getAllItem() {
    return await RoomDAO.getAll();
  }

  static async addItem(data) {
    return await RoomDAO.create({
      Room_name: data.room_name,
      Creator: data.creator,
      Created_at: new Date()
    });
  }

  static async deleteItem(roomId) {
    return await RoomDAO.delete(roomId);
  }

  static async updateItem(data) {
    return await RoomDAO.update(data._id, data.Room_name);
  }
}