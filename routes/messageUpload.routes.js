import express from "express";
import multer from "multer";
import fs from "fs";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../config/cloudinary.js";
import MessageController from "../controllers/message.controller.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const upload = multer({ dest: "temp/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTKEY);

    const { roomId } = req.body;
    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: "Invalid roomId" });
    }

    const imageUrl = await uploadToCloudinary(req.file.path);

    const message = await MessageController.addItem({
      Room_id: new ObjectId(roomId),
      Sender_id: new ObjectId(decoded.userId),
      Content: imageUrl,
      Timestamp: new Date(),
      Type: "Image"
    });

    fs.unlinkSync(req.file.path);

    res.json({ message });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload image failed" });
  }
});

export default router;