import { socketServer } from './server.js';
import mongodb from "mongodb";
import dotenv from "dotenv";

import HomeController from './api/homeController.js';

async function main() {
    /* Init the dotenv library */
    dotenv.config();

    const PORT = process.env.PORT || 8080;

    const client = new mongodb.MongoClient(process.env.DB_URI);

    try {
        await client.connect();

        await HomeController.injectDB(client);


        socketServer.listen(PORT, () => {
            console.log(`http running on port ` + port);
        });

    } catch (e) {
        console.error(`index.js error ${e}`);
        process.exit(1);
    }
}



main().catch(console.error);