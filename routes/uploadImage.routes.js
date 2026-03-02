import express from "express";
import multer from "multer";
import fs from "fs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    jwt.verify(token, process.env.JWTKEY);

    const result = await cloudinary.uploader.upload(
      req.file.path.replace(/\\/g, "/"),
      { folder: "chat_app_messages" }
    );

    const imageUrl = result.secure_url;

    fs.unlinkSync(req.file.path);

    return res.json({ imageUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;