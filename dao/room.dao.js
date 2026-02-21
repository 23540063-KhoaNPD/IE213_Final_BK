import { ObjectId } from "mongodb";

let collection;

export default class RoomDAO {

  static async injectDB(conn) {
    if (collection) return;
    collection = await conn.db(process.env.DB_CONTAINER).collection(process.env.COLLECTION_ROOM);
  }

  static async getAll() {
    return await collection.find().toArray();
  }

  static async create(room) {
    return await collection.insertOne(room);
  }

  static async delete(roomId) {
    return await collection.deleteOne({ _id: new ObjectId(roomId) });
  }

  static async update(id, data) {
    return await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
  }
}