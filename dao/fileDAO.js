import mongodb from "mongodb";

let db_data;

export default class RoomDAO{
 static async injectDB(connection) {
        if (db_data) return;

        try {
            db_data = await connection.db(process.env.DB_CONTAINER).collection(process.env.COLLECTION_FILE);
        } catch (e) {
            console.error(`File DAO error ${e}`);
        }
    }

    static async getAllItem() {
        return await db_data.find().toArray();
    }

    static async addItem(item) {
        try {
            const timestamp = new Date().toISOString();
            const roomId = new ObjectId(item.room_id);
            const itemData = {
                Room_id: item.room_id,
                Sender_id: roomId,
                Content: item.content,
                Type: item.type,
                Timestamp: timestamp
            };
            return await db_data.insertOne(itemData);
        } catch (e) {
            console.error(`Unable to add item ${e}`);
            return { error: e }
        }
    }

    static async updateItem(itemId, item) {
        try {
            const roomId = new ObjectId(item.room_id);
            const senderId = new ObjectId(item.sender_id);
            const updateRes = await db_data.updateOne({ _id: new ObjectId(itemId) },
                {
                    $set: {
                        Room_id: roomId,
                        Sender_id: senderId,
                        Content: item.content,
                        Type: item.type,
                    }
                });

            return updateRes;
        } catch (e) {
            console.error(`unable to update item ${e}`);
            return { error: e.message };
        }
    }

    static async deleteItem(id) {
        try {
            const deleteResponse = await db_data.deleteOne({
                _id: new ObjectId(id)
            });
            return deleteResponse;
        } catch (e) {
            console.error(`unable to delete: ${e}`);
            return { error: e };
        }
    }

}