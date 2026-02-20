import { ObjectId } from "mongodb";

let db;
let collection;

export default class UserDAO {

  static async injectDB(conn) {
    if (collection) return;
    db = conn;
    collection = await conn.db(process.env.DB_CONTAINER).collection(process.env.COLLECTION_USER);
  }

  static async findByEmail(email) {
    return await collection.findOne({ Email: email });
  }

  static async create(user) {
    return await collection.insertOne(user);
  }

  static async findById(id) {
    console.log("findById ID:", id);
    
    return await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { Username: 1, Avatar: 1 } }
    );
  }

  static async updateAvatar(userId, avatar) {
    return await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { Avatar: avatar } }
    );
  }
}