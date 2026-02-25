import { ObjectId } from "mongodb";

let db;
let collection;

export default class UserDAO {

  static async injectDB(conn) {
    if (collection) return;
    db = conn;
    collection = await conn
      .db(process.env.DB_CONTAINER)
      .collection(process.env.COLLECTION_USER);
  }

  static async findByEmail(email) {
    return await collection.findOne({ Email: email });
  }

  static async create(user) {
    return await collection.insertOne(user);
  }

  static async findById(id) {
    if (!id) return null;

    let objectId;

    if (id instanceof ObjectId) {
      objectId = id;
    } else if (ObjectId.isValid(id)) {
      objectId = new ObjectId(id);
    } else {
      return null;
    }

    return await collection.findOne(
      { _id: objectId },
      { projection: { Username: 1, Avatar: 1 } }
    );
  }

  static async update(userId, updateFields) {
    return await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );
  }

  static async updateAvatar(userId, avatar) {
    return await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { Avatar: avatar } }
    );
  }

  static async findByResetToken(token) {
    return await collection.findOne({ ResetToken: token });
  }

  static async clearResetToken(userId) {
    return await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ResetToken: null,
          ResetTokenExp: null
        }
      }
    );
  }

}