console.log(`starting user controller`)

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserDAO from "../dao/user.dao.js"
import crypto from "crypto";;
import { sendResetEmail } from "../utils/sendEmail.js";

const SALT = 10;

export default class UserController {

  static async login(req, res) {

    const { Email, PW } = req.body;

    const user = await UserDAO.findByEmail(Email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const match = await bcrypt.compare(PW, user.PW);

    if (!match) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.Email, username: user.Username },
      process.env.JWTKEY,
      { expiresIn: "1h" }
    );

    res.setHeader("Content-Type", "application/json; charset=utf-8");

    console.log(user.Username);

    res.json({
      token,
      userId: user._id,
      username: user.Username
    });
  }

  static async findByEmail(email) {
    return await UserDAO.findByEmail(email);
  }

  static async signup(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await UserDAO.findByEmail(email);

      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const hashed = await bcrypt.hash(password, SALT);

      await UserDAO.create({
        Username: name.trim(),
        Email: email.toLowerCase().trim(),
        PW: hashed,
        Avatar: null,
        ResetToken: null,
        ResetTokenExp: null
      });

      res.status(201).json({ message: "User created" });

    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async findById(id) {
    return await UserDAO.findById(id);
  }

  static async updateAvatar(userId, avatar) {
    return await UserDAO.updateAvatar(userId, avatar);
  }

  static async requestReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      console.log(`find email: ${email}`);

      const user = await UserDAO.findByEmail(email);

      if (!user) {
        return res.json({ message: "If email exists, reset link sent" });
      }

      const rawToken = crypto.randomBytes(32).toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      await UserDAO.update(user._id, {
        ResetToken: hashedToken,
        ResetTokenExp: new Date(Date.now() + 15 * 60 * 1000)
      });

      await sendResetEmail(user.Email, rawToken);

      res.json({ message: "If email exists, reset link sent" });

    } catch (error) {
      console.error("REQUEST RESET ERROR:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async resetPassword(req, res) {

    const { token, newPassword } = req.body;

    //  Hash token nhận được
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Tìm user bằng hashed token
    const user = await UserDAO.findByResetToken(hashedToken);

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (!user.ResetTokenExp || user.ResetTokenExp < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT);

    // Update password + clear token
    await UserDAO.update(user._id, {
      PW: hashedPassword,
      ResetToken: null,
      ResetTokenExp: null
    });

    res.json({ message: "Password updated successfully" });
  }

  static async updateName(req, res) {
    console.log(`update controller point:`)
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Name is required" });
      }

      const userId = req.userId;
      console.log(`check user id `, req.userId)

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await UserDAO.update(userId, {
        Username: name.trim()
      });

      res.json({ name: name.trim() });

    } catch (error) {
      console.error("UPDATE NAME ERROR:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async updateNameById(userId, name) {
    return await UserDAO.update(userId, {
      Username: name
    });
  }

  static async getAllUsers() {
    return await UserDAO.getAll();
  }

  static async addHiddenRoom(userId, roomId) {
    return await UserDAO.addHiddenRoom(userId, roomId);
  }

}