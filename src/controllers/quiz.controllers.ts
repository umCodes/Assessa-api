import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";

import { MAX_NUM_OF_QUESTIONS, MIN_NUM_OF_QUESTIONS } from "../constants/constriants.constants";
import { creditsPerQuestion } from "../constants/credits.constants";
import { openRouterApiKey, llmModels } from "../constants/env";

import { HttpError } from "../errors/http-error";
import { getCollection } from "../db/db";

import { AuthRequest } from "../middlewares/auth-handler.middlewares";
import { CreditsRequest } from "../middlewares/file-processor.middlewares";

import {
    difficultyLevels,
    FIB,
    MCQ,
    Questions,
    QuestionTypes,
    questionTypes,
    Quiz,
    SAQ,
    TF
} from "../models/quiz.types";
import { User } from "../models/user.types";

import { generateQuizFromLlm } from "../utils/llm";
import { subtractUserCredits } from "../utils/credits";

/* ───────────────────────────── GET TOTAL QUIZZES ───────────────────────────── */

export async function getTotalQuizzes(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const uid = String(req.user?.uid);
        if (!uid) throw new HttpError("Unauthorized", 401);

        const quizesCollection = await getCollection<Quiz>("quizHistories");
        if (!quizesCollection) throw new HttpError("Collection not found", 404);

        const totalQuizzes = await quizesCollection.countDocuments({ uid });
        res.json({ totalQuizzes });
    } catch (error) {
        console.log(
            "🔴 Error fetching total quizzes at ./controllers/quiz.controllers.ts -> getTotalQuizzes():"
        );
        next(error);
    }
}

/* ───────────────────────────── GET QUIZZES ───────────────────────────── */

export async function getQuizzes(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const page = Number(req.query.page || 0);
    const limit = 10;
    const skip = page * limit;

    const uid = String(req.user?.uid);

    try {
        if (!uid) throw new HttpError("Unauthorized", 401);

        const quizesCollection = await getCollection<Quiz>("quizHistories");
        if (!quizesCollection) throw new HttpError("Collection not found", 404);

        const length = await quizesCollection.countDocuments({ uid });

        const quizes = await quizesCollection
            .find({ uid })
            .sort({ _id: -1 })
            // .skip(skip)
            // .limit(limit)
            .toArray();

        res.json({ quizes, length });
    } catch (error) {
        console.log(
            "🔴 Error fetching quizzes at ./controllers/quiz.controllers.ts -> getQuizzes():"
        );
        next(error);
    }
}

/* ───────────────────────────── GET SINGLE QUIZ ───────────────────────────── */

export async function getQuiz(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const quizId = String(req.query.id);
    const uid = String(req.user?.uid);

    try {
        if (!uid) throw new HttpError("Unauthorized", 401);
        if (!quizId) throw new HttpError("Quiz ID not provided", 400);

        const quizesCollection = await getCollection<Quiz>("quizHistories");
        if (!quizesCollection) throw new HttpError("Collection not found", 500);

        const quiz = await quizesCollection.findOne({
            uid,
            _id: new ObjectId(quizId),
        });

        res.json(quiz);
    } catch (error) {
        console.log(
            "🔴 Error fetching quiz at ./controllers/quiz.controllers.ts -> getQuiz():"
        );
        next(error);
    }
}

/* ───────────────────────────── DELETE QUIZ ───────────────────────────── */

export async function deleteQuiz(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const quizId = String(req.query.id);
    const uid = String(req.user?.uid);

    try {
        if (!uid) throw new HttpError("Unauthorized", 401);
        if (!quizId) throw new HttpError("Quiz ID not provided", 400);

        const quizesCollection = await getCollection<Quiz>("quizHistories");
        if (!quizesCollection) throw new HttpError("Collection not found", 500);

        await quizesCollection.deleteOne({
            uid,
            _id: new ObjectId(quizId),
        });

        res.status(204).json({ message: "delete successful" });
    } catch (error) {
        console.log(
            "🔴 Error deleting quiz at ./controllers/quiz.controllers.ts -> deleteQuiz():"
        );
        next(error);
    }
}

/* ───────────────────────────── CREATE QUIZ ───────────────────────────── */

export async function createQuiz(
    req: AuthRequest & CreditsRequest,
    res: Response,
    next: NextFunction
) {
    const { body } = req;
    const { subject, difficulty, file_type } = body;

    const qTypes = JSON.parse(body.qTypes);
    const number = Number(body.number) as Quiz["number"];

    try {
        const uid = req.user?.uid;
        if (!uid) throw new HttpError("Unauthorized", 401);

        if (!subject) throw new HttpError("Subject is required", 400);
        if (!difficultyLevels.includes(difficulty))
            throw new HttpError("Invalid difficulty level", 400);
        if (!qTypes?.every((q: QuestionTypes) => questionTypes.includes(q)))
            throw new HttpError("Invalid question types", 400);
        if (!number || isNaN(number))
            throw new HttpError("Number of questions is required", 400);
        if (number > MAX_NUM_OF_QUESTIONS || number < MIN_NUM_OF_QUESTIONS)
            throw new HttpError("Invalid number of questions", 400);
        if (typeof req.credits !== "number")
            throw new HttpError("Something went wrong, please try again.", 500);

        const usersBase = await getCollection<User>("users");
        if (!usersBase) throw new HttpError("Could not connect to database", 500);

        const userCredits = (
            await usersBase.findOne(
                { _id: new ObjectId(uid) },
                { projection: { credits: 1 } }
            )
        )?.credits;

        const preCredits = req.credits + creditsPerQuestion * number;

        if (userCredits === undefined)
            throw new HttpError("Could not fetch user credits", 500);
        if (userCredits < preCredits)
            throw new HttpError("Insufficient Credits.", 402);

        let groups = Math.floor(number / 20);
        const remaining = number % 20;
        if (remaining) groups++;

        let allQuestions: (TF | MCQ | SAQ | FIB)[] = [];
        let topic = "";

        while (groups > 0) {
            const prev = JSON.stringify(allQuestions.map(q => q.question));
            const noOfQuestions =
                groups === 1 && remaining ? remaining : 20;

            const questions: Questions = await generateQuizFromLlm({
                subject,
                qTypes,
                difficulty,
                number: noOfQuestions,
                prev,
            });

            if (!questions)
                throw new HttpError("A problem occurred generating quiz", 500);

            allQuestions.push(...questions.questions);
            groups--;

            if (!groups) topic = questions.topic;
        }

        const credits = Number(
            (req.credits + creditsPerQuestion * allQuestions.length).toFixed(2)
        );

        const quiz: Quiz = {
            uid: String(uid),
            type: "Quiz",
            created_at: new Date().toISOString(),
            generated_from: `${file_type as "image" | "text"} pdf`,
            topic,
            difficulty,
            question_types: qTypes,
            number: allQuestions.length,
            credits,
            questions: allQuestions,
        };

        const quizHistories = await getCollection<Quiz>("quizHistories");
        if (!quizHistories)
            throw new HttpError("Could not connect to database", 500);

        const { acknowledged } = await quizHistories.insertOne(quiz);
        if (!acknowledged)
            throw new HttpError("Could not store quiz data", 500);

        await subtractUserCredits(quiz.credits, String(uid));

        res.status(201).json(quiz);
    } catch (error) {
        console.log(
            "🔴 Error creating quiz at ./controllers/quiz.controllers.ts -> createQuiz():"
        );
        next(error);
    }
}

/* ───────────────────────────── CHECK ANSWER ───────────────────────────── */

export async function checkQuestionAnswer(
    req: AuthRequest & CreditsRequest,
    res: Response,
    next: NextFunction
) {
    const uid = String(req.user?.uid);
    const { question, answer, explanation } = req.body;

    try {
        if (!uid) throw new HttpError("Unauthorized", 401);

        const request = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${openRouterApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: llmModels.deepseek_r1,
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
            }
        );

        const response = await request.json();
        const message = response.choices[0].message.content
            .replaceAll("`", "")
            .replace("json", "");

        const parsed = JSON.parse(message);

        if (!parsed?.valid)
            throw new HttpError(parsed.reason, 400);

        res.status(200).json(parsed);
    } catch (error) {
        console.log(
            "🔴 Error checking answer at ./controllers/quiz.controllers.ts -> checkQuestionAnswer():"
        );
        next(error);
    }
}