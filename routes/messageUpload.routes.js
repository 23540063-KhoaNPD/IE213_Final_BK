import express from "express";
import multer from "multer";
import fs from "fs";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../config/cloudinary.js";
import MessageController from "../controllers/message.controller.js";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();
const upload = multer({ dest: "temp/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("REQ.FILE:", req.file);   // 👈 THÊM DÒNG NÀY
    console.log("REQ.BODY:", req.body);   // 👈 THÊM DÒNG NÀY

    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTKEY);

    const { roomId } = req.body;

    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: "Invalid roomId" });
    }

    const result = await cloudinary.uploader.upload(
      req.file.path.replace(/\\/g, "/"),
      { folder: "chat_app_avatars" }
    );

    console.log("CLOUDINARY RESULT:", result);

    const imageUrl = result.secure_url;

    console.log("IMAGE URL:", imageUrl);

    const message = await MessageController.addItem({
      roomId: roomId,
      userId: decoded.userId,
      content: imageUrl,
      type: "Image"
    });

    fs.unlinkSync(req.file.path);

    console.log("FINAL MESSAGE:", message);
    res.json({ message });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload image failed" });
  }
});

export default router;