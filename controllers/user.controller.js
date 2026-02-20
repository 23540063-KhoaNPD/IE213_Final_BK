import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserDAO from "../dao/user.dao.js";

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
      { userId: user._id.toString(), email: user.Email },
      process.env.JWTKEY,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      userId: user._id,
      username: user.Username
    });
  }

  static async signup(req, res) {

    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, SALT);

    await UserDAO.create({
      Username: name,
      Email: email,
      PW: hashed,
      Avatar: null
    });

    res.json({ message: "User created" });
  }

  static async findById(id) {
    return await UserDAO.findById(id);
  }

  static async updateAvatar(userId, avatar) {
    return await UserDAO.updateAvatar(userId, avatar);
  }
}