import express from "express";
import UserController from "../controllers/user.controller.js";

const router = express.Router();

router.post("/login", UserController.login);
router.post("/signup", UserController.signup);

export default router;