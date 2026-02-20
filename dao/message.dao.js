import { ObjectId } from "mongodb";

let collection;

export default class MessageDAO {

    static async injectDB(conn) {
        if (collection) return;
        collection = conn.db(process.env.DB_CONTAINER).collection(process.env.COLLECTION_MSG);
    }

    static async create(message) {
        const result = await collection.insertOne(message);
        return { ...message, _id: result.insertedId };
    }

static async getByRoom(roomId) {

    return await collection
        .find({ Room_id: new ObjectId(roomId) })
        .sort({ Timestamp: 1 })
        .toArray();
}
}