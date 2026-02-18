import messageDAO from '../dao/messageDAO.js';

let temp_db;
let temp_room_count;

export default class MessageController {

    static async injectDB(item){

        try{
          await messageDAO.injectDB(item);
           temp_db = await messageDAO.getAllItem();
        } catch (e){
            console.log(`message db inject failed ${e}`)
        }
    }

    static async getAllItem(){
        return await messageDAO.getAllItem();
    }

    static async getPage(){
        return await messageDAO.getItemByPage();
    }

    static async addItem(item){
        const result = await messageDAO.addItem(item);
        return result;
    }

    static async getMessage(query){

        // console.log(`check input at msg controller:`, query);
        let filter = {};
        filter.room_id = query.room_id;

        // console.log(`check param before call dao:`, filter);

        const retVal = await messageDAO.getMessage(filter);
        return retVal;
    }
}