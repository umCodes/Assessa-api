import { Router } from "express";
import { getUser, sendFeedback, updateUserName } from "../controllers/user.controllers";



const userRouter = Router();

userRouter.get('/user', getUser)
userRouter.put('/user/name', updateUserName)
userRouter.post('/api/feedback', sendFeedback)

export default userRouter