import { ObjectId } from "mongodb";
import { getCollection } from "../db/db";
import { User } from "../models/user.types";
import { HttpError } from "../errors/http-error";




export async function subtractUserCredits(credits: number, uid: string){
    try {
        
        const usersBase = await getCollection<User>('users');
        if(!usersBase) throw new Error('Could not connect to database');
        const userCredits = (await usersBase.findOne({_id: new ObjectId(uid)}, {projection: {credits: 1}}))?.credits;
        if(!userCredits && userCredits !== 0) throw new Error('Could not fetch user credits');
        if(userCredits > credits){
            await usersBase.updateOne({_id: new ObjectId(uid)},
            {$set: { credits: Number((userCredits - credits).toFixed(2))}})
        }else{
            throw new HttpError("Insufficient Credit.", 402);
        }

    } catch (error) {
        throw error;        
    }
} 