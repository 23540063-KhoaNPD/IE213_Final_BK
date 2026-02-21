import { ObjectId } from "mongodb";

let collection;

export default class MessageDeletedDAO {

    static async injectDB(conn) {
        if (collection) return;

        collection = conn
            .db(process.env.DB_CONTAINER)
            .collection(process.env.COLLECTION_MSG_DELETED);
    }

    static async create(message) {
        return await collection.insertOne({
            ...message,
            deletedAt: new Date()
        });
    }
}