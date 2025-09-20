import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import { signatures, tokenAge } from "../utils/env";
import { getCollection } from "../db/db";
import { HttpError } from "../errors/http-error";
import { validateInput } from "../utils/auth";
import { initialCredits } from "../constants/credits.constants";
import { UserPayload } from "../models/jwt.types";
import { User } from "../models/user.types";
import { clearDBRefreshToken, storeTokensInCookies } from "../utils/tokens";
import crypto from 'crypto';

function hashIP(ip: string) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}


export async function signUp(req: Request, res: Response, next: NextFunction){
    
    //mock sign up
    const {name, email, password} = req.body
    const refereshToken = req.cookies['refresh-token'];

    try{
        //validate user input    
        if(validateInput(email, password) !== true) return;

        //Check if user exist
        const userBase = await getCollection<User>('users');
        if(!userBase) throw new HttpError('Could not connect to database', 500);
        
        //if user already exist, log them in instead
        if(await userBase.findOne({email})) return login(req, res, next);
        

        //Hash password and store user in db
        const hashedPasword = await bcrypt.hash(password, 12);
        const user = await userBase.insertOne({
            name, email, password: hashedPasword, 
            refresh_tokens: [], created_at: new Date().toISOString(), credits: initialCredits
        })
        if(!user) throw new HttpError('Could not create user', 500);
        
        const uid = user.insertedId.toString();

        //Generate and store tokens in cookies
        const payload = {
            sub: uid, 
            aud: "user"
        }

        const tokens = {
            access: jwt.sign(payload, signatures.accessToken, {expiresIn: tokenAge.access}),
            refresh: jwt.sign(payload, signatures.refreshToken, {expiresIn: tokenAge.refresh}),
        }
        
        await storeTokensInCookies(res,tokens, uid);
        res.status(201).json({message: 'User created', uid, name, email});
        return;

    }catch (error) {
        console.error('🔴 error sign up user at ./controllers/auth.controllers.ts -> signup(): ');
        return next(error);
    }
} 

export async function login(req: Request, res: Response, next: NextFunction){
    
    //mock sign up
    const {name, email, password} = req.body
    const refereshToken = req.cookies['refresh-token'];

    try{
        //validate user input    
        if(validateInput(email, password) !== true) return;

        //Check if user exist
        const userBase = await getCollection<User>('users');
        if(!userBase) throw new HttpError('Could not connect to database', 500);
        //Check if user already exist
        const user = await userBase.findOne({email})
        const uid = user?._id?.toString();
        if(!user|| !uid) throw new HttpError('User not found', 404);

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch) throw new HttpError('Invalid credentials', 400);        
        
        //Generate and store tokens in cookies
        const payload = {
            sub: uid, 
            aud: "user"
        }
        const tokens = {
            access: jwt.sign(payload, signatures.accessToken, {expiresIn: tokenAge.access}),
            refresh: jwt.sign(payload, signatures.refreshToken, {expiresIn: tokenAge.refresh}),
        }
        if(refereshToken) await clearDBRefreshToken(uid, refereshToken)
        await storeTokensInCookies(res,tokens, uid);

        res.status(200).json({message: 'Log in successfull'});
        return;

    }catch (error) {
        console.error('🔴 error logging in user at ./controllers/auth.controllers.ts -> login(): ');
        return next(error);
    }
} 

export async function logout(req: Request, res: Response, next: NextFunction){
    //Get RefreshToken
    const refreshToken = req.cookies['refresh-token'];
    if(!refreshToken) return;

    const payload = jwt.verify(refreshToken, String(process.env.REFRESH_TOKEN_SIGNATURE)) as UserPayload; 
    const {sub} = payload;

    try {
        //Clear refresh token from database:
        await clearDBRefreshToken(String(sub), refreshToken);

        //Clear tokens from cookies:
        res.clearCookie('refresh-token');
        res.clearCookie('access-token');
        res.status(204).json({
            message: "logout successfull"
        })
        return;
    } catch (error) {
        console.error('🔴 error logging out user at ./controllers/auth.controllers.ts -> logout(): ');
        next(error);
    }
    
}