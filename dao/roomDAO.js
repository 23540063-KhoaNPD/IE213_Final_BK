import {ObjectId} from "mongodb";

let db_data;

export default class RoomDAO {

    static async getRoomName(id) {
    const result = await db_data.findOne({
        _id: new ObjectId(id)
    });

    return result?.Room_name || null;
}

    static async injectDB(connection) {
        if (db_data) return;

        try {
            db_data = await connection.db(process.env.DB_CONTAINER).collection(process.env.COLLECTION_ROOM);
            console.log(`room db injected`);
        } catch (e) {
            console.error(`Room DAO error ${e}`);
        }
    }

    static async getAllItem() {
        return await db_data.find().toArray();
    }

    static async getItemByPage({page = 0, limit = 50} = {}){
        let cursor;
        try{
            cursor = await db_data.find().limit(limit).skip(page * limit).toArray();
            return cursor;
        } catch(e ){
            console.error(`Error while load page ${e}`)
            return null;
        }
    }

    static async addItem(item) {
        try {
            const timestamp = new Date().toISOString();
            const creator = new ObjectId(item.creator);
            const itemData = {
                Room_name: item.room_name,
                Manager: creator,
                Create_at: timestamp
            };
            return await db_data.insertOne(itemData);
        } catch (e) {
            console.error(`Unable to add item ${e}`);
            return { error: e }
        }
    }

    static async updateItem(itemId, item) {
        try {
            
            const updateRes = await db_data.updateOne({ _id: new ObjectId(itemId) },
                {
                    $set: {
                        Room_name: item.room_name,
                        Create_at: timestamp
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