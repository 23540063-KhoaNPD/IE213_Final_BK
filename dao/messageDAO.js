import { Timestamp , ObjectId} from "mongodb";

let db_data;

export default class MessageDAO {

    static async getMessage({room_id = 0, page = 0, limit = 20} = {}){


        // console.log(`check input at DAO `, room_id);
       let query;
        if (room_id) {
            query = {"Room_id": new ObjectId(room_id)};
            // console.log(`check query`, query);
        } else {
            console.log(`filter is null`)
        }

       const retVal = await db_data.find(query).limit(parseInt(limit)).skip(parseInt(page)* parseInt(limit)).toArray();

    //    console.log(`check query output`, retVal);
    // const retVal = "await db_data.find()";

        return retVal;
    }

    static async injectDB(connection) {
        if (db_data) return;

        try {
            db_data = await connection.db(process.env.DB_CONTAINER).collection(process.env.COLLECTION_MSG);
        } catch (e) {
            console.error(`Message DAO error ${e}`);
        }
    }

    static async getAllItem() {
        return await db_data.find().toArray();
    }

    static async addItem(item) {
    try {

        const itemData = {
            Room_id: new ObjectId(item.Room_id),
            Sender_id: new ObjectId(item.Sender_id),
            Content: item.Content,
            Type: item.Type || "Text",
            Timestamp: item.Timestamp || new Date()
        };

        const result = await db_data.insertOne(itemData);

        return {
            insertedId: result.insertedId,
            ...itemData
        };

    } catch (e) {
        console.error(`Unable to add item ${e}`);
        return { error: e };
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