"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quiz_controllers_1 = require("../controllers/quiz.controllers");
const file_processor_middlewares_1 = require("../middlewares/file-processor.middlewares");
const multer_middlewares_1 = __importDefault(require("../middlewares/multer.middlewares"));
const quizRouter = (0, express_1.Router)();
quizRouter.post('/quiz', multer_middlewares_1.default, file_processor_middlewares_1.processFile, quiz_controllers_1.createQuiz);
quizRouter.post('/check', quiz_controllers_1.checkQuestionAnswer);
quizRouter.get('/quizzes', quiz_controllers_1.getQuizzes);
quizRouter.get('/quizzes-total', quiz_controllers_1.getTotalQuizzes);
quizRouter.get('/quiz', quiz_controllers_1.getQuiz);
quizRouter.delete('/quiz', quiz_controllers_1.deleteQuiz);
exports.default = quizRouter;
//# sourceMappingURL=quiz.routes.js.map