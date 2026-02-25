import dotenv from "dotenv";
dotenv.config();

import mongodb from 'mongodb';

import appServer from "./server.js";

import UserDAO from "./dao/user.dao.js";
import RoomDAO from "./dao/room.dao.js";
import MessageDAO from "./dao/message.dao.js";
import MessageDeletedDAO from "./dao/messageDeleted.dao.js";




const PORT = process.env.PORT || 8080;
const client = new mongodb.MongoClient(process.env.DB_URI);

async function startServer() {
  try {

    await client.connect();
    // console.log("MongoDB connected");

    // const db = client.db(process.env.DB_URI);

    // Inject DB vào các DAO
    await UserDAO.injectDB(client);
    await RoomDAO.injectDB(client);
    await MessageDAO.injectDB(client);
    await MessageDeletedDAO.injectDB(client);

    appServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Server start error:", err);
    process.exit(1);
  }
}

startServer();