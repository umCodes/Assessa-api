import { NextFunction, Request, Response } from "express";



export async function cookieHandler(req: Request, res: Response, next: NextFunction){
    console.log(req.cookies);
    
    next();
    
}