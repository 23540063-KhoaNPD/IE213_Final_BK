import express from 'express';
import cors from 'cors';
import { createServer } from "http";
import { Server } from "socket.io";
import router from './api/routing.js';

import HomeController from './api/homeController.js';
import MessageController from './api/messageController.js';

import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

import path from 'path';
import UserController from './api/userController.js';
import RoomController from './api/roomController.js';

/** common for http request and websocket io */
const app = express();

app.use(cors({
    origin: "*",
    methods: ["POST"]
}));

app.use(express.json());

/** define api endpoint for user login */
app.use("/", router);

app.use('/{*any}', (req, res) => {
    res.status(404).json({ error: "not found" });
})

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


const socketServer = createServer(app);

const io = new Server(socketServer, {
    cors: { origin: "*" },
    methods: ["GET", "POST"]
});

// const userSocket = new Map();

let SECRET;

io.use((socket, next) => {

    dotenv.config();

    SECRET = process.env.JWTKEY;

    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Unauthorized"));
        }

        const decoded = jwt.verify(token, SECRET);

        socket.userId = decoded.userId;
        socket.email = decoded.email;

        next();

    } catch (err) {
        console.log("Socket JWT error:", err.message);
        return next(new Error("Unauthorized"));
    }
});


io.on("connection", (socket) => {

    socket.emit("my_info", {
        userId: socket.userId
    });

    /* ===== LOAD ROOM LIST ===== */
    socket.on("get_rooms", async () => {
        const rooms = await HomeController.get_AllRoom();
        socket.emit("room_list", rooms);
    });

    /* ===== JOIN ROOM ===== */
    socket.on("join_room", async (roomId) => {

        socket.join(roomId);

        const history = await HomeController.getRoomMessage(roomId);

        // thêm Sender_name cho từng message
        const historyWithName = await Promise.all(
            history.map(async (msg) => {
                const name = await UserController.findName(msg.Sender_id);
                return {
                    ...msg,
                    Sender_name: name
                };
            })
        );

        socket.emit("chat_history", historyWithName);
    });



    socket.on("send_msg", async ({ roomId, message }) => {

        if (!roomId || !message) return;
        if (!ObjectId.isValid(roomId)) return;

        const messageData = {
            Room_id: roomId,           // string
            Sender_id: socket.userId,  // string
            Content: message,
            Timestamp: new Date(),
            Type: "Text"
        };

        const savedMessage = await MessageController.addItem(messageData);

        io.to(roomId).emit("receive_msg", savedMessage);
    });

    socket.on("create_room", async (data) => {

        try {

            const result = await RoomController.addItem({
                room_name: data.roomName,
                creator: socket.userId   // 👈 lấy từ JWT middleware
            });

            // Lấy lại danh sách room
            const rooms = await RoomController.getAllItem();

            io.emit("room_list", rooms);

            // console.log(`check output:`, result);

            const insertedRoomId = result.insertedId;

            socket.join(insertedRoomId.toString());
            socket.emit("join_room", insertedRoomId.toString());

        } catch (err) {
            console.log("Create room error:", err);
        }
    });

    socket.on("delete_room", async (data) => {

        try {

            await RoomController.deleteItem(data.roomId);

            const rooms = await RoomController.getAllItem();

            io.emit("room_list", rooms);

        } catch (err) {
            console.log("Delete room error:", err);
        }

    });



    /* ===== DISCONNECT ===== */
    socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`);
    });

});




export { socketServer, io, app };