import { NextFunction, Request, Response } from "express";
import { database } from "..";
import { ObjectId } from "mongodb";
import nodemailer from 'nodemailer';
import { HttpError } from "../errors/http-error";
import { getCollection } from "../db/db";
import { User } from "../models/user.types";
import { AuthRequest } from "../middlewares/auth-handler.middlewares";



export async function getUser(req: AuthRequest, res: Response, next: NextFunction){    
    //User ID
    const uid = String(req.user?.uid) || null; 

    try{
        if(!uid) throw new HttpError('Unauthorized', 401);
    
        const users = await getCollection<User>('users');
        if(!users) throw new HttpError('Collection not found', 500);
        
        const user = await users.findOne({
            _id: new ObjectId(String(uid))
        }, {projection: { password: 0, _id: 0, refresh_tokens: 0 }})

        res.json(user);
        return;
    }catch(error){
        console.log(error);
        next(error);
        return;
    }
}



export async function sendFeedback(req: Request, res: Response, next: NextFunction){

  const { email, subject, message } = req.body;
  console.log(email, subject, message);
    
  const transporter = nodemailer.createTransport({
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
    subject: `KwizMe Feedback: ${subject} (from ${email})`,
    text: message
  }).catch(err => next(err));

  res.send({ success: true });
  return;
};



export async function updateUserName(req: AuthRequest, res:Response, next: NextFunction){
    const { prevName, newName } = req.body;
    console.log(prevName, newName);
    
    //User ID
    const uid = String(req.user?.uid) || null; 

    try{
        if(!uid) throw new HttpError('Unauthorized', 401);
    
        const users = (await database)?.collection<User>('users');
        if(!users) throw new HttpError('Collection not found', 500);
        
        const user = await users.findOne({
            _id: new ObjectId(String(uid))
        }, {projection: { password: 0, _id: 0, refresh_tokens: 0 }})
        console.log(user);
        
        if(user?.name === prevName){
            await users.updateOne({
                _id: new ObjectId(String(uid))
            }, {$set: {name: newName}})
            res.status(200).json(newName);
            console.log('success fully updated to ', newName);
            
        }

        return;
    }catch(error){
        console.log(error);
        next(error);
        return;
    }
    
}