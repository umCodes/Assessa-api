import { JwtPayload } from "jsonwebtoken"
import { ObjectId } from "mongodb"


export type UserPayload = JwtPayload & {
    uid: ObjectId | string;
    name?: string;
    email?: string;
    credits?: number;
}

