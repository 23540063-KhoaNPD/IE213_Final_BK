import express from "express";
import UserController from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", UserController.login);
router.post("/signup", UserController.signup);

router.post("/request-reset", UserController.requestReset);

router.post("/reset-password", UserController.resetPassword);
router.put("/update-name", verifyToken,  UserController.updateName);

export default router;