"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeTokensInCookies = storeTokensInCookies;
exports.hashToken = hashToken;
exports.compareTokens = compareTokens;
exports.clearDBRefreshToken = clearDBRefreshToken;
exports.verifyTokens = verifyTokens;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_error_1 = require("../errors/http-error");
const env_1 = require("./env");
const db_1 = require("../db/db");
const mongodb_1 = require("mongodb");
async function storeTokensInCookies(res, tokens, uid) {
    //Send tokens to client in cookies
    if (tokens?.access)
        res.cookie("access-token", tokens.access, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24 * 7 //1 week
        });
    if (tokens?.refresh) {
        res.cookie("refresh-token", tokens.refresh, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24 * 7 //1 week
        });
        //Save referesh token in db
        const userBase = await (0, db_1.getCollection)('users');
        if (!userBase)
            throw new http_error_1.HttpError('Could not connect to database', 500);
        const user = await userBase.findOne({ _id: new mongodb_1.ObjectId(uid) });
        if (!user)
            throw new http_error_1.HttpError('User not found', 404);
        await userBase.updateOne({ _id: new mongodb_1.ObjectId(uid) }, { $push: { refreshTokens: hashToken(tokens.refresh, env_1.signatures.tokensStorage) } });
    }
}
function hashToken(token, secret) {
    return crypto_1.default.createHmac("sha256", secret).update(token).digest("hex");
}
function compareTokens(token1, token2) {
    const uid1 = jsonwebtoken_1.default.decode(token1).uid;
    const uid2 = jsonwebtoken_1.default.decode(token2).uid;
    return uid1 === uid2;
}
async function clearDBRefreshToken(uid, refreshToken) {
    try {
        console.log(uid);
        if (!uid)
            throw new Error('user not provided');
        //Get Database...
        const userBase = await (0, db_1.getCollection)('users');
        if (!userBase)
            throw new Error('Could not connect to database');
        //Find user with uid
        const user = await userBase.findOne({ _id: new mongodb_1.ObjectId(uid) });
        //compare each encrypted refresh token in db with .cookies['refresh-token']
        //then remove the matching one from refresh tokens list in db
        user?.refresh_tokens?.forEach(hashedtoken => {
            //Find client's old refresh token within refresh_tokens[...hashedTokens]
            if (hashToken(refreshToken, env_1.signatures.tokensStorage) === hashedtoken)
                //if matching, clear hashedtoken from refresh_tokens[...hashedTokens]
                userBase
                    .updateOne({ _id: new mongodb_1.ObjectId(uid) }, { $pull: { refresh_tokens: hashedtoken } });
        });
    }
    catch (error) {
        console.error('🔴 error clearing refresh token at ./utils/tokens.ts -> clearDBRefreshToken(): ');
        throw error;
    }
}
async function verifyTokens(req, res, next) {
    //Get access token
    const token = String(req.cookies["access-token"]);
    //Throws an error if token doesn't exist
    if (!token) {
        return next(new http_error_1.HttpError("Please provide an access token.", 400));
    }
    //Verify token
    jsonwebtoken_1.default.verify(token, env_1.signatures.accessToken, async (err, decoded) => {
        console.log(err, "no error");
        if (err)
            return next(new http_error_1.HttpError('Access Forbidden', 403));
        // req.user = {uid: (decoded).uid};
        // console.log(req.user);
        next();
        return;
    });
}
//# sourceMappingURL=tokens.js.map