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

  /* ===== GET ROOMS FOR USER ===== */
  static async getRoomsForUser(userId) {
    return await collection.find({
      $or: [
        { isPrivate: false },
        { members: new ObjectId(userId) }
      ]
    }).toArray();
  }

  static async getById(id) {
    return await collection.findOne({
      _id: new ObjectId(id)
    });
  }

  static async findDirectRoom(userA, userB) {
    return await collection.findOne({
      isDirect: true,
      members: {
        $all: [
          new ObjectId(userA),
          new ObjectId(userB)
        ],
        $size: 2
      }
    });
  }

    static async find(filter) {
    return await collection.find(filter).toArray();
  }

}