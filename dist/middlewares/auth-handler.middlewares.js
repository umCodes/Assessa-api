"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokens = refreshTokens;
exports.authenticateToken = authenticateToken;
const http_error_1 = require("../errors/http-error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../utils/env");
const tokens_1 = require("../utils/tokens");
function compareTokens(token1, token2) {
    const uid1 = jsonwebtoken_1.default.decode(token1).sub;
    const uid2 = jsonwebtoken_1.default.decode(token2).sub;
    return uid1 === uid2;
}
async function refreshTokens(req, res, next) {
    //Get Tokens...
    const refreshToken = req.cookies['refresh-token'];
    const accessToken = req.cookies['access-token'];
    if (!refreshToken || !accessToken)
        throw new http_error_1.HttpError('Access or Refresh Token not provided.', 400);
    if (!compareTokens(accessToken, refreshToken))
        throw new http_error_1.HttpError('Invalid access token.', 403);
    //Extract UID
    const accessPayload = jsonwebtoken_1.default.decode(accessToken);
    const refreshPayload = jsonwebtoken_1.default.decode(refreshToken);
    const uid = refreshPayload.sub;
    if (!uid)
        throw new http_error_1.HttpError('Invalid token payload.', 403);
    //Refresh expired tokens
    const tokens = {};
    if (Date.now() > Number(accessPayload.exp) * 1000)
        tokens.access = jsonwebtoken_1.default.sign({ uid }, env_1.signatures.accessToken, { expiresIn: env_1.tokenAge.access });
    if (Date.now() > Number(refreshPayload.exp) * 1000)
        tokens.refresh = jsonwebtoken_1.default.sign({ uid }, env_1.signatures.accessToken, { expiresIn: env_1.tokenAge.access });
    if (tokens.refresh)
        (0, tokens_1.clearDBRefreshToken)(String(uid), refreshToken);
    //Store in cookies:
    (0, tokens_1.storeTokensInCookies)(res, tokens, String(uid));
    //Update request cookies if token is updated
    req.cookies["access-token"] = tokens.access || accessToken;
    req.cookies["refresh-token"] = tokens.refresh || refreshToken;
    return next();
}
async function authenticateToken(req, res, next) {
    //Get Access token
    const token = req.cookies['access-token'];
    try {
        //Throws an error if token doesn't exist
        if (!token)
            throw new http_error_1.HttpError("Please provide an access token.", 400);
        //Verify token
        // console.log(token, signatures.accessToken);
        const decoded = jsonwebtoken_1.default.verify(token, env_1.signatures.accessToken);
        //🟢 debbuging log
        // console.log(err, "no error");
        if (!decoded)
            throw new http_error_1.HttpError('Access Forbidden', 400);
        console.log(token, decoded);
        //set user in req
        req.user = { uid: String(decoded.sub) };
        console.log(req.user);
        next();
        return;
    }
    catch (error) {
        console.error(error);
        next(error);
    }
}
//# sourceMappingURL=auth-handler.middlewares.js.map