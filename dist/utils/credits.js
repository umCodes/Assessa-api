"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtractUserCredits = subtractUserCredits;
const mongodb_1 = require("mongodb");
const db_1 = require("../db/db");
const http_error_1 = require("../errors/http-error");
async function subtractUserCredits(credits, uid) {
    try {
        const usersBase = await (0, db_1.getCollection)('users');
        if (!usersBase)
            throw new Error('Could not connect to database');
        const userCredits = (await usersBase.findOne({ _id: new mongodb_1.ObjectId(uid) }, { projection: { credits: 1 } }))?.credits;
        if (!userCredits && userCredits !== 0)
            throw new Error('Could not fetch user credits');
        if (userCredits > credits) {
            await usersBase.updateOne({ _id: new mongodb_1.ObjectId(uid) }, { $set: { credits: Number((userCredits - credits).toFixed(2)) } });
        }
        else {
            throw new http_error_1.HttpError("Insufficient Credit.", 402);
        }
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=credits.js.map