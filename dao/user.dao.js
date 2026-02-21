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

    // Nếu id không tồn tại
    if (!id) return null;

    let objectId;

    // Nếu đã là ObjectId thì dùng luôn
    if (id instanceof ObjectId) {
      objectId = id;
    }
    // Nếu là string và hợp lệ thì convert
    else if (ObjectId.isValid(id)) {
      objectId = new ObjectId(id);
    }
    // Nếu không hợp lệ
    else {
      console.warn("Invalid ObjectId:", id);
      return null;
    }

    return await collection.findOne(
      { _id: objectId },
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