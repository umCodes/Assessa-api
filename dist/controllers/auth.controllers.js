"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUp = signUp;
exports.login = login;
exports.logout = logout;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../utils/env");
const db_1 = require("../db/db");
const http_error_1 = require("../errors/http-error");
const auth_1 = require("../utils/auth");
const credits_constants_1 = require("../constants/credits.constants");
const tokens_1 = require("../utils/tokens");
const crypto_1 = __importDefault(require("crypto"));
function hashIP(ip) {
    return crypto_1.default.createHash('sha256').update(ip).digest('hex');
}
async function signUp(req, res, next) {
    //mock sign up
    const { name, email, password } = req.body;
    const refereshToken = req.cookies['refresh-token'];
    try {
        //validate user input    
        if ((0, auth_1.validateInput)(email, password) !== true)
            return;
        //Check if user exist
        const userBase = await (0, db_1.getCollection)('users');
        if (!userBase)
            throw new http_error_1.HttpError('Could not connect to database', 500);
        //if user already exist, log them in instead
        if (await userBase.findOne({ email }))
            return login(req, res, next);
        //Hash password and store user in db
        const hashedPasword = await bcrypt_1.default.hash(password, 12);
        const user = await userBase.insertOne({
            name, email, password: hashedPasword,
            refresh_tokens: [], created_at: new Date().toISOString(), credits: credits_constants_1.initialCredits
        });
        if (!user)
            throw new http_error_1.HttpError('Could not create user', 500);
        const uid = user.insertedId.toString();
        //Generate and store tokens in cookies
        const payload = {
            sub: uid,
            aud: "user"
        };
        const tokens = {
            access: jsonwebtoken_1.default.sign(payload, env_1.signatures.accessToken, { expiresIn: env_1.tokenAge.access }),
            refresh: jsonwebtoken_1.default.sign(payload, env_1.signatures.refreshToken, { expiresIn: env_1.tokenAge.refresh }),
        };
        await (0, tokens_1.storeTokensInCookies)(res, tokens, uid);
        res.status(201).json({ message: 'User created', uid, name, email });
        return;
    }
    catch (error) {
        console.error('🔴 error sign up user at ./controllers/auth.controllers.ts -> signup(): ');
        return next(error);
    }
}
async function login(req, res, next) {
    //mock sign up
    const { name, email, password } = req.body;
    const refereshToken = req.cookies['refresh-token'];
    try {
        //validate user input    
        if ((0, auth_1.validateInput)(email, password) !== true)
            return;
        //Check if user exist
        const userBase = await (0, db_1.getCollection)('users');
        if (!userBase)
            throw new http_error_1.HttpError('Could not connect to database', 500);
        //Check if user already exist
        const user = await userBase.findOne({ email });
        const uid = user?._id?.toString();
        if (!user || !uid)
            throw new http_error_1.HttpError('User not found', 404);
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch)
            throw new http_error_1.HttpError('Invalid credentials', 400);
        //Generate and store tokens in cookies
        const payload = {
            sub: uid,
            aud: "user"
        };
        const tokens = {
            access: jsonwebtoken_1.default.sign(payload, env_1.signatures.accessToken, { expiresIn: env_1.tokenAge.access }),
            refresh: jsonwebtoken_1.default.sign(payload, env_1.signatures.refreshToken, { expiresIn: env_1.tokenAge.refresh }),
        };
        if (refereshToken)
            await (0, tokens_1.clearDBRefreshToken)(uid, refereshToken);
        await (0, tokens_1.storeTokensInCookies)(res, tokens, uid);
        res.status(200).json({ message: 'Log in successfull' });
        return;
    }
    catch (error) {
        console.error('🔴 error logging in user at ./controllers/auth.controllers.ts -> login(): ');
        return next(error);
    }
}
async function logout(req, res, next) {
    //Get RefreshToken
    const refreshToken = req.cookies['refresh-token'];
    if (!refreshToken)
        return;
    const payload = jsonwebtoken_1.default.verify(refreshToken, String(process.env.REFRESH_TOKEN_SIGNATURE));
    const { sub } = payload;
    try {
        //Clear refresh token from database:
        await (0, tokens_1.clearDBRefreshToken)(String(sub), refreshToken);
        //Clear tokens from cookies:
        res.clearCookie('refresh-token');
        res.clearCookie('access-token');
        res.status(204).json({
            message: "logout successfull"
        });
        return;
    }
    catch (error) {
        console.error('🔴 error logging out user at ./controllers/auth.controllers.ts -> logout(): ');
        next(error);
    }
}
//# sourceMappingURL=auth.controllers.js.map