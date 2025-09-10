import { ObjectId } from "mongodb";

export type User = {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  refresh_tokens?: string[];
  credits: number,
  created_at?: string;
};

export type RequestUser = {
    uid: string | ObjectId;
}