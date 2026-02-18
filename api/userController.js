import { response } from "express";
import UserDAO from "../dao/userDAO.js";
import { ObjectId } from "mongodb";
import HomeController from "./homeController.js";
import jwt from 'jsonwebtoken';

let SECRET;

export default class UserController {
    static async login(req, res, next) {
        try {

            SECRET = process.env.JWTKEY;

            const { Email, PW } = req.body;

            if (!Email || !PW) {
                return res.status(400).json({ message: "Email or password is null" });
            }

            const user_login = await UserDAO.verifyUser({ Email, PW });

            if (!user_login) {
                return res.status(401).json({ message: "Invalid Email or Password" });
            }

            const token = jwt.sign(
                {
                    userId: user_login._id.toString(),   // PHẢI là userId
                    email: user_login.Email
                },
                SECRET,
                { expiresIn: "30d" }
            );



            return res.json({
                token,
                userId: user_login._id.toString(),
                username: user_login.Username
            });

        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Login error" });
        }
    }


    static async injectDB(db) {
        try {
            await UserDAO.injectDB(db);
        } catch (e) {
            console.log(`user controller injecting db error ${e}`);
        }
    }

    static async createItem(item) {

        const item_new = {
            name: item.name,
            pw: item.pw,
            email: item.email,
            avatar: item.avatar
        };

        const result = await UserDAO.addItem(item_new);

        if (result) {
            console.log(`Created user ${result.name}`);
        } else {
            console.log(`Create user failed`);
        }


    }

    static async checkId(id) {
        return await UserDAO.onConnectCheckId(id);
    }

    static async findName(id) {
        return await UserDAO.getUserName(id);
    }
}