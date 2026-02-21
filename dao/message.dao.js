import { ObjectId } from "mongodb";

let collection;

export default class MessageDAO {

    static async injectDB(conn) {
        if (collection) return;
        collection = conn
            .db(process.env.DB_CONTAINER)
            .collection(process.env.COLLECTION_MSG);
    }

    static async create(message) {
        const result = await collection.insertOne(message);
        if (!result) {
            throw new Error("message dao error create");
        }
        return { ...message, _id: result.insertedId };
    }

    static async getByRoom(roomId) {
        return await collection
            .find({ Room_id: new ObjectId(roomId) })
            .sort({ Timestamp: 1 })
            .toArray();
    }

    /* ================= NEW ================= */

    static async findById(id) {
        if (!ObjectId.isValid(id)) return null;

        return await collection.findOne({
            _id: new ObjectId(id)
        });
    }

    static async update(id, data) {
        if (!ObjectId.isValid(id)) return null;

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...data,
                    Edited: true
                }
            },
            {
                returnDocument: "after"
            }
        );

        return result.value;
    }

    static async delete(id) {
        if (!ObjectId.isValid(id)) return null;

        return await collection.deleteOne({
            _id: new ObjectId(id)
        });
    }
}