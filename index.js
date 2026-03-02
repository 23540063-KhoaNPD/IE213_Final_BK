import dotenv from "dotenv";
dotenv.config();

import mongodb from 'mongodb';

import appServer from "./server.js";

import UserDAO from "./dao/user.dao.js";
import RoomDAO from "./dao/room.dao.js";
import MessageDAO from "./dao/message.dao.js";
import MessageDeletedDAO from "./dao/messageDeleted.dao.js";

import axios from "axios";

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

    appServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Server start error:", err);
    process.exit(1);
  }
}

const url = process.env.BACKEND_URL; // Replace with your Render URL
const interval = 30000; // Interval in milliseconds (30 seconds)

//Reloader Function
function reloadWebsite() {
  axios.get(url)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
      console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
    });
}

setInterval(reloadWebsite, interval);

startServer();