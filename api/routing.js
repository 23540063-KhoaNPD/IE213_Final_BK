import express from 'express';
import UserController from './userController.js';

const router = express.Router();


router.route('/api/v1/user/login').post(UserController.login);

router.route('/').post(UserController.login);


export default router;