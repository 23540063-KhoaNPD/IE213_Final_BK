import MessageDAO from "../dao/message.dao.js";

export default class MessageController {

  static async addItem(data) {
    return await MessageDAO.create(data);
  }

  static async getByRoom(roomId) {
    return await MessageDAO.getByRoom(roomId);
  }
}