"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalQuizzes = getTotalQuizzes;
exports.getQuizzes = getQuizzes;
exports.getQuiz = getQuiz;
exports.deleteQuiz = deleteQuiz;
exports.createQuiz = createQuiz;
exports.checkQuestionAnswer = checkQuestionAnswer;
const mongodb_1 = require("mongodb");
const constriants_constants_1 = require("../constants/constriants.constants");
const credits_constants_1 = require("../constants/credits.constants");
const env_1 = require("../constants/env");
const http_error_1 = require("../errors/http-error");
const db_1 = require("../db/db");
const quiz_types_1 = require("../models/quiz.types");
const llm_1 = require("../utils/llm");
const credits_1 = require("../utils/credits");
/* ───────────────────────────── GET TOTAL QUIZZES ───────────────────────────── */
async function getTotalQuizzes(req, res, next) {
    try {
        const uid = String(req.user?.uid);
        if (!uid)
            throw new http_error_1.HttpError("Unauthorized", 401);
        const quizesCollection = await (0, db_1.getCollection)("quizHistories");
        if (!quizesCollection)
            throw new http_error_1.HttpError("Collection not found", 404);
        const totalQuizzes = await quizesCollection.countDocuments({ uid });
        res.json({ totalQuizzes });
    }
    catch (error) {
        console.log("🔴 Error fetching total quizzes at ./controllers/quiz.controllers.ts -> getTotalQuizzes():");
        next(error);
    }
}
/* ───────────────────────────── GET QUIZZES ───────────────────────────── */
async function getQuizzes(req, res, next) {
    const page = Number(req.query.page || 0);
    const limit = 10;
    const skip = page * limit;
    const uid = String(req.user?.uid);
    try {
        if (!uid)
            throw new http_error_1.HttpError("Unauthorized", 401);
        const quizesCollection = await (0, db_1.getCollection)("quizHistories");
        if (!quizesCollection)
            throw new http_error_1.HttpError("Collection not found", 404);
        const length = await quizesCollection.countDocuments({ uid });
        const quizes = await quizesCollection
            .find({ uid })
            .sort({ _id: -1 })
            // .skip(skip)
            // .limit(limit)
            .toArray();
        res.json({ quizes, length });
    }
    catch (error) {
        console.log("🔴 Error fetching quizzes at ./controllers/quiz.controllers.ts -> getQuizzes():");
        next(error);
    }
}
/* ───────────────────────────── GET SINGLE QUIZ ───────────────────────────── */
async function getQuiz(req, res, next) {
    const quizId = String(req.query.id);
    const uid = String(req.user?.uid);
    try {
        if (!uid)
            throw new http_error_1.HttpError("Unauthorized", 401);
        if (!quizId)
            throw new http_error_1.HttpError("Quiz ID not provided", 400);
        const quizesCollection = await (0, db_1.getCollection)("quizHistories");
        if (!quizesCollection)
            throw new http_error_1.HttpError("Collection not found", 500);
        const quiz = await quizesCollection.findOne({
            uid,
            _id: new mongodb_1.ObjectId(quizId),
        });
        res.json(quiz);
    }
    catch (error) {
        console.log("🔴 Error fetching quiz at ./controllers/quiz.controllers.ts -> getQuiz():");
        next(error);
    }
}
/* ───────────────────────────── DELETE QUIZ ───────────────────────────── */
async function deleteQuiz(req, res, next) {
    const quizId = String(req.query.id);
    const uid = String(req.user?.uid);
    try {
        if (!uid)
            throw new http_error_1.HttpError("Unauthorized", 401);
        if (!quizId)
            throw new http_error_1.HttpError("Quiz ID not provided", 400);
        const quizesCollection = await (0, db_1.getCollection)("quizHistories");
        if (!quizesCollection)
            throw new http_error_1.HttpError("Collection not found", 500);
        await quizesCollection.deleteOne({
            uid,
            _id: new mongodb_1.ObjectId(quizId),
        });
        res.status(204).json({ message: "delete successful" });
    }
    catch (error) {
        console.log("🔴 Error deleting quiz at ./controllers/quiz.controllers.ts -> deleteQuiz():");
        next(error);
    }
}
/* ───────────────────────────── CREATE QUIZ ───────────────────────────── */
async function createQuiz(req, res, next) {
    const { body } = req;
    const { subject, difficulty, file_type } = body;
    const qTypes = JSON.parse(body.qTypes);
    const number = Number(body.number);
    try {
        const uid = req.user?.uid;
        if (!uid)
            throw new http_error_1.HttpError("Unauthorized", 401);
        if (!subject)
            throw new http_error_1.HttpError("Subject is required", 400);
        if (!quiz_types_1.difficultyLevels.includes(difficulty))
            throw new http_error_1.HttpError("Invalid difficulty level", 400);
        if (!qTypes?.every((q) => quiz_types_1.questionTypes.includes(q)))
            throw new http_error_1.HttpError("Invalid question types", 400);
        if (!number || isNaN(number))
            throw new http_error_1.HttpError("Number of questions is required", 400);
        if (number > constriants_constants_1.maxNumOfQuestions || number < constriants_constants_1.minNumOfQuestions)
            throw new http_error_1.HttpError("Invalid number of questions", 400);
        if (typeof req.credits !== "number")
            throw new http_error_1.HttpError("Something went wrong, please try again.", 500);
        const usersBase = await (0, db_1.getCollection)("users");
        if (!usersBase)
            throw new http_error_1.HttpError("Could not connect to database", 500);
        const userCredits = (await usersBase.findOne({ _id: new mongodb_1.ObjectId(uid) }, { projection: { credits: 1 } }))?.credits;
        const preCredits = req.credits + credits_constants_1.creditsPerQuestion * number;
        if (userCredits === undefined)
            throw new http_error_1.HttpError("Could not fetch user credits", 500);
        if (userCredits < preCredits)
            throw new http_error_1.HttpError("Insufficient Credits.", 402);
        let groups = Math.floor(number / 20);
        const remaining = number % 20;
        if (remaining)
            groups++;
        let allQuestions = [];
        let topic = "";
        while (groups > 0) {
            const prev = JSON.stringify(allQuestions.map(q => q.question));
            const noOfQuestions = groups === 1 && remaining ? remaining : 20;
            const questions = await (0, llm_1.generateQuizFromLlm)({
                subject,
                qTypes,
                difficulty,
                number: noOfQuestions,
                prev,
            });
            if (!questions)
                throw new http_error_1.HttpError("A problem occurred generating quiz", 500);
            allQuestions.push(...questions.questions);
            groups--;
            if (!groups)
                topic = questions.topic;
        }
        const credits = Number((req.credits + credits_constants_1.creditsPerQuestion * allQuestions.length).toFixed(2));
        const quiz = {
            uid: String(uid),
            type: "Quiz",
            created_at: new Date().toISOString(),
            generated_from: `${file_type} pdf`,
            topic,
            difficulty,
            question_types: qTypes,
            number: allQuestions.length,
            credits,
            questions: allQuestions,
        };
        const quizHistories = await (0, db_1.getCollection)("quizHistories");
        if (!quizHistories)
            throw new http_error_1.HttpError("Could not connect to database", 500);
        const { acknowledged } = await quizHistories.insertOne(quiz);
        if (!acknowledged)
            throw new http_error_1.HttpError("Could not store quiz data", 500);
        await (0, credits_1.subtractUserCredits)(quiz.credits, String(uid));
        res.status(201).json(quiz);
    }
    catch (error) {
        console.log("🔴 Error creating quiz at ./controllers/quiz.controllers.ts -> createQuiz():");
        next(error);
    }
}
/* ───────────────────────────── CHECK ANSWER ───────────────────────────── */
async function checkQuestionAnswer(req, res, next) {
    const uid = String(req.user?.uid);
    const { question, answer, explanation } = req.body;
    try {
        if (!uid)
            throw new http_error_1.HttpError("Unauthorized", 401);
        const request = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env_1.openRouterApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: env_1.llmModels.deepseek_r1,
                messages: [
                    {
                        role: "user",
                        content: `
                                You are given:
                                question: {${question}}
                                answer: {${answer}}
                                explanation: {${explanation}}
                                
                                Return only JSON:
                                { "valid": false, "reason": "..." }
                                OR
                                { "valid": true, "correct": true|false }
                            `,
                    },
                ],
            }),
        });
        const response = await request.json();
        const message = response.choices[0].message.content
            .replaceAll("`", "")
            .replace("json", "");
        const parsed = JSON.parse(message);
        if (!parsed?.valid)
            throw new http_error_1.HttpError(parsed.reason, 400);
        res.status(200).json(parsed);
    }
    catch (error) {
        console.log("🔴 Error checking answer at ./controllers/quiz.controllers.ts -> checkQuestionAnswer():");
        next(error);
    }
}
//# sourceMappingURL=quiz.controllers.js.map