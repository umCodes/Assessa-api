import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import jwt from 'jsonwebtoken'
import { signatures, tokenAge } from "../utils/env";
import { UserPayload } from "../models/jwt.types";
import { clearDBRefreshToken, storeTokensInCookies } from "../utils/tokens";


export interface AuthRequest extends Request {
  user?: UserPayload;
}




function compareTokens(token1: string, token2: string) {
    const uid1 = (jwt.decode(token1) as UserPayload).sub;
    const uid2 = (jwt.decode(token2) as UserPayload).sub;
    return uid1 === uid2
}



export async function refreshTokens(req: Request, res: Response, next: NextFunction){
    
    //Get Tokens...
    const refreshToken = req.cookies['refresh-token'];
    const accessToken = req.cookies['access-token'];   
        
    if(!refreshToken || !accessToken) throw new HttpError('Access or Refresh Token not provided.', 400);
    if(!compareTokens(accessToken, refreshToken)) throw new HttpError('Invalid access token.', 403);

    //Extract UID
    const accessPayload = (jwt.decode(accessToken) as UserPayload);
    const refreshPayload = (jwt.decode(refreshToken) as UserPayload);

    const uid = refreshPayload.sub;
    if(!uid) throw new HttpError('Invalid token payload.', 403);
    
    //Refresh expired tokens
    const tokens: {
        access?: string,
        refresh?: string 
    } = {};

    if(Date.now() > Number(accessPayload.exp) * 1000)
        tokens.access = jwt.sign({uid}, signatures.accessToken, { expiresIn: tokenAge.access })
    if(Date.now() > Number(refreshPayload.exp) * 1000)
        tokens.refresh = jwt.sign({uid}, signatures.accessToken, { expiresIn: tokenAge.access })


    if(tokens.refresh) clearDBRefreshToken(String(uid), refreshToken)
   
    //Store in cookies:
    storeTokensInCookies(res, tokens, String(uid));

    //Update request cookies if token is updated
    req.cookies["access-token"] = tokens.access || accessToken;
    req.cookies["refresh-token"] = tokens.refresh || refreshToken;
    
    return next();

}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction ) {
    
    //Get Access token
    const token = req.cookies['access-token'];
    try{
        //Throws an error if token doesn't exist
        if(!token) throw new HttpError("Please provide an access token.", 400);    
        
        //Verify token
        // console.log(token, signatures.accessToken);
        const decoded = jwt.verify(token, signatures.accessToken);
        
        //🟢 debbuging log
        // console.log(err, "no error");
        if(!decoded) throw new HttpError('Access Forbidden', 400);  
        console.log(token, decoded);
        
        //set user in req
        req.user = {uid: String((decoded as UserPayload).sub)};
        console.log(req.user);
        
        next();
        return;
        
    }catch(error){
        console.error(error);
        next(error)
    }
} 