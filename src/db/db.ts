import {MongoClient, ObjectId} from 'mongodb';
import { mongoDBName, mongoURI } from '../utils/env';
import { database } from '..';


const client = new MongoClient(mongoURI);

export async function connectToDB(){
    try {
        const mongodb = await client.connect();
        if (!mongodb) return console.log('Error connecting to DB.');        
        console.log('Connected to DB.');
        return mongodb.db(mongoDBName);
    } catch (error) {
        console.log(error);
        return;
    }
}

export async function  getCollection<T>(name: string) {
    const db = await database;
    if(!db) return null;
    return db.collection<T & {_id?: ObjectId}>(name);
    
}

