import mongodb from 'mongodb';
import { ObjectId } from 'mongodb';
import MessDAO from './messageDAO.js';
import RoomDAO from './roomDAO.js';
import UserDAO from './userDAO.js'

let mess_data, room_data, file_data;
let user_count = [];


export default class HomeDAO {

    static async initHome() {
        mess_data = MessDAO.getAllItem();
        room_data = RoomDAO.getAllItem();
    }

    static async add_user(user) {
        user_count.push(user._id);
        UserDAO.addItem(user);
    }

    static async count_user() {
        return user_count.length();
    }

    static async find_id(id) {
        return await UserDAO.findId(id);
    }

}