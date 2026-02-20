import express from "express";
import multer from "multer";
import fs from "fs";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../config/cloudinary.js";
import UserController from "../controllers/user.controller.js";

const router = express.Router();
const upload = multer({ dest: "temp/" });

router.post("/", upload.single("avatar"), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTKEY);

    const imageUrl = await uploadToCloudinary(
      req.file.path.replace(/\\/g, "/")
    );

    await UserController.updateAvatar(decoded.userId, imageUrl);

    fs.unlinkSync(req.file.path);

    res.json({ avatar: imageUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload avatar failed" });
  }
});

export default router;