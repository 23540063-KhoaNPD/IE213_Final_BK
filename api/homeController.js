import RoomController from "./roomController.js";

import MessageController from "./messageController.js";
import UserController from "./userController.js";
import jwt from 'jsonwebtoken';
import { ObjectId } from "mongodb";

let temp_db;
let temp_room_count;
let temp_room;
let temp_msg;

export default class HomeController {

    static async injectDB(item) {

        try {
            await RoomController.injectDB(item);
            await UserController.injectDB(item);
            await MessageController.injectDB(item);

            //    temp_room = await RoomController.getAllItem();

            //    console.log(`data injected`);
        } catch (e) {
            console.log(`Room db inject failed ${e}`)
        }
    }

    static async checkId(id) {
        return await UserController.checkId(id);
    }


    static async get_AllRoom() {
        return await RoomController.getAllItem();
    }

    static async getUserName(id) {
        return await UserController.findName(id);
    }

    static async getRoomMessage(query) {
        console.log(`home controller check input`, query);

        const temp_data = {
            room_id: query
        }
        return await MessageController.getMessage(temp_data);
    }

    static async saveMessage(messageData) {

        const result = await MessageController.addItem(messageData);

        return {
            _id: result.insertedId,
            ...messageData
        };
    }

    static async createRoom() {
        const result = await RoomController.addItem(item);
        return result;
    }

}