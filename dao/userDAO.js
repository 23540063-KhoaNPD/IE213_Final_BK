import mongodb from "mongodb";
import bcrypt from 'bcrypt';
import { ObjectId } from "mongodb";

let db_data;
let user;
const saltRound = 10;

export default class UserDAO {

    static async injectDB(connection) {
        if (db_data) return;

        try {
            db_data = await connection.db(process.env.DB_CONTAINER).collection(process.env.COLLECTION_USER);
        } catch (e) {
            console.error(`User DAO error ${e}`);
        }
    }

    static async getAllItem() {
        return await db_data.find().toArray();
    }

    static async verifyUser(data) {

        const user = await db_data.findOne({ Email: data.Email });

        if (user) {
            const match = await bcrypt.compare(data.PW, user.PW);

            if (match) {
                console.log(`email ${data.Email} logged in`);
                return user;  
            }

            return null;
        }

        console.log(`login failed`);
        return null;
    }


    static async onConnectCheckId(id) {
        let retVal = db_data.findOne(new ObjectId(id));
        console.log(retVal);
        if (retVal) return true;
        else return false;
    }


    static async addItem(item) {
        try {
            const pw = hashPass(item.pass);

            const itemData = {
                Username: item.name,
                PW: pw,
                Email: item.email,
                Avatar: item.avatar
            };

            /** */
            return await db_data.insertOne(itemData);
        } catch (e) {
            console.error(`Unable to add item ${e}`);
            return { error: e }
        }
    }

    static async getUserId() {
        return user._id;
    }

    static async getUserName(id) {
        const result = await db_data.findOne({
            _id: new ObjectId(id)
        });

        return result?.Username || null;
    }

    async hashPass(params) {
        const hash = await bcrypt.hash(params, saltRound);
        return hash;
    }

}