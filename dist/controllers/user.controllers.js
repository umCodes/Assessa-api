"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.sendFeedback = sendFeedback;
exports.updateUserName = updateUserName;
const __1 = require("..");
const mongodb_1 = require("mongodb");
const nodemailer_1 = __importDefault(require("nodemailer"));
const http_error_1 = require("../errors/http-error");
const db_1 = require("../db/db");
async function getUser(req, res, next) {
    //User ID
    const uid = String(req.user?.uid) || null;
    try {
        if (!uid)
            throw new http_error_1.HttpError('Unauthorized', 401);
        const users = await (0, db_1.getCollection)('users');
        if (!users)
            throw new http_error_1.HttpError('Collection not found', 500);
        const user = await users.findOne({
            _id: new mongodb_1.ObjectId(String(uid))
        }, { projection: { password: 0, _id: 0, refresh_tokens: 0 } });
        res.json(user);
        return;
    }
    catch (error) {
        console.log(error);
        next(error);
        return;
    }
}
async function sendFeedback(req, res, next) {
    const { email, subject, message } = req.body;
    console.log(email, subject, message);
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: String(process.env.EMAIL),
            pass: String(process.env.EMAIL_PASSWORD)
        }
    });
    console.log(email);
    await transporter.sendMail({
        from: email,
        to: String(process.env.EMAIL),
        subject: `ShoeBill Feedback: ${subject} (from ${email})`,
        text: message
    }).catch(err => next(err));
    res.send({ success: true });
    return;
}
;
async function updateUserName(req, res, next) {
    const { prevName, newName } = req.body;
    console.log(prevName, newName);
    //User ID
    const uid = String(req.user?.uid) || null;
    try {
        if (!uid)
            throw new http_error_1.HttpError('Unauthorized', 401);
        const users = (await __1.database)?.collection('users');
        if (!users)
            throw new http_error_1.HttpError('Collection not found', 500);
        const user = await users.findOne({
            _id: new mongodb_1.ObjectId(String(uid))
        }, { projection: { password: 0, _id: 0, refresh_tokens: 0 } });
        console.log(user);
        if (user?.name === prevName) {
            await users.updateOne({
                _id: new mongodb_1.ObjectId(String(uid))
            }, { $set: { name: newName } });
            res.status(200).json(newName);
            console.log('success fully updated to ', newName);
        }
        return;
    }
    catch (error) {
        console.log(error);
        next(error);
        return;
    }
}
//# sourceMappingURL=user.controllers.js.map