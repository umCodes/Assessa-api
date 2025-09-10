import { Router } from "express";
import { checkQuestionAnswer, createQuiz, deleteQuiz, getQuiz, getQuizzes } from "../controllers/quiz.controllers";
import { processFile } from "../middlewares/file-processor.middlewares";
import upload from "../middlewares/multer.middlewares";
const quizRouter = Router();

quizRouter.post('/quiz', upload, processFile ,createQuiz)
quizRouter.post('/check', checkQuestionAnswer)
quizRouter.get('/quizzes', getQuizzes);
quizRouter.get('/quiz', getQuiz);
quizRouter.delete('/quiz', deleteQuiz);

export default quizRouter;