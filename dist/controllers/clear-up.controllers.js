"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearUpPaper = clearUpPaper;
const quiz_types_1 = require("../models/quiz.types");
const http_error_1 = require("../errors/http-error");
const db_1 = require("../db/db");
const mongodb_1 = require("mongodb");
const llm_1 = require("../utils/llm");
const credits_1 = require("../utils/credits");
const prompts_1 = require("../utils/prompts");
async function clearUpPaper(req, res, next) {
    const { file, body } = req;
    const { file_type, subject } = body;
    const qTypes = JSON.parse(body.qTypes);
    try {
        //Check if file exists
        if (!file)
            throw new http_error_1.HttpError('File not provided.', 400);
        //Validate User
        const uid = req.user?.uid;
        if (!uid)
            throw new http_error_1.HttpError('Unauthorized', 401);
        //Validate whether:
        //- Subject is valid
        if (!subject || !Array.isArray(subject) || subject.length === 0)
            throw new http_error_1.HttpError('Invalid subject', 400);
        //- Question types is valid
        if (!qTypes || !qTypes.every(q => quiz_types_1.questionTypes.includes(q)))
            throw new http_error_1.HttpError('Invalid question types', 400);
        //- File type is valid 
        if (!file_type || !['image', 'text'].some(f => f === file_type))
            throw new http_error_1.HttpError('Invalid file type', 400);
        //- Credits are preCalculated
        if (!req.credits)
            throw new http_error_1.HttpError('Something went wrong, please try again.', 500);
        //- User credits are sufficient to procceed task 
        const credits = req.credits;
        //Get and validate userbase
        const usersBase = await (0, db_1.getCollection)('users');
        if (!usersBase)
            throw new http_error_1.HttpError('Could not connect to database', 500);
        //Check whether user has enough credits for the task 
        const userCredits = (await usersBase.findOne({ _id: new mongodb_1.ObjectId(uid) }, { projection: { credits: 1 } }))?.credits;
        if (!userCredits && userCredits !== 0)
            throw new http_error_1.HttpError('Could not fetch user credits', 500);
        if (userCredits < credits)
            throw new http_error_1.HttpError("Insufficient Credits.", 402);
        //Prompt subject(array of extracted text from file) to llm in parallel(sync) 
        const request = subject.slice(0, 10).map((page) => llm_1.ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: (0, prompts_1.clearUpPrompt)({
                subject: page,
                qTypes,
                prev: ''
            }),
        }));
        //Await all the llm responses in parallel
        const response = await Promise.all(request);
        const questions = response.flatMap(q => {
            //declutter llm response and parse it into a valid json
            const string = String(q.text).replaceAll('`', '').replaceAll('\n', '').replace('json', '');
            const parsed = JSON.parse(string);
            return parsed.questions;
        });
        if (questions.length <= 0)
            throw new http_error_1.HttpError("Something went wrong", 400);
        //Set up clear up
        const clearUp = {
            uid: String(uid), // user mongodb _id
            type: "Clear-up", // the process/service (clearup or quiz) created from 
            created_at: new Date().toISOString(), // creation date
            title: file?.originalname || `Quiz-${Date.now()}`, // title
            generated_from: `${file_type} pdf`, // file type subject was extracted from 
            question_types: qTypes,
            number: questions.length, // number of questions
            credits, // credits used for this process
            questions, // the actuall generated questions
        };
        //Store quiz in db 
        const quizHistories = await (0, db_1.getCollection)('quizHistories');
        if (!quizHistories)
            throw new http_error_1.HttpError('Could not connect to database', 500);
        const { acknowledged } = await quizHistories?.insertOne(clearUp);
        if (!acknowledged)
            throw new http_error_1.HttpError('Could not store clear up data', 500);
        //Subtract credits
        (0, credits_1.subtractUserCredits)(credits, String(uid));
        if (!clearUp.credits || !uid)
            throw new http_error_1.HttpError('Something went wrong, please try again.', 500);
        res.status(201).json(clearUp);
        return;
    }
    catch (error) {
        return next(error);
    }
}
//# sourceMappingURL=clear-up.controllers.js.map