import { Router } from "express";
import { login, logout, signUp } from "../controllers/auth.controllers";

const authRouter = Router();

authRouter.post('/signup', signUp);
authRouter.post('/login', login);
authRouter.delete('/logout', logout);


export default authRouter;