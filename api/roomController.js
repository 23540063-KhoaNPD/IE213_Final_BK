import RoomDAO from '../dao/roomDAO.js';
import roomDAO from '../dao/roomDAO.js';

let temp_db;
let temp_room_count;

export default class RoomController {

    static async injectDB(item){

        try{
          await roomDAO.injectDB(item);
        //    console.log(`rooms data injected`);

        } catch (e){
            console.log(`Room db inject failed ${e}`)
        }
    }

    static async getAllItem(){
        return await roomDAO.getAllItem();
    }

    static async getPage(){
        return await roomDAO.getItemByPage();
    }

    static async addItem(item){
        const result = await roomDAO.addItem(item);
        // if(result){
        //     temp_db += result;
        // }
        return result;
    }

    static async findName(id){
        return await RoomDAO.getRoomName(id);
    }

    static async deleteItem(id){
        return await RoomDAO.deleteItem(id);
    }
}