"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDB = connectToDB;
exports.getCollection = getCollection;
const mongodb_1 = require("mongodb");
const env_1 = require("../utils/env");
const __1 = require("..");
const client = new mongodb_1.MongoClient(env_1.mongoURI);
async function connectToDB() {
    try {
        const mongodb = await client.connect();
        if (!mongodb)
            return console.log('Error connecting to DB.');
        console.log('Connected to DB.');
        return mongodb.db(env_1.mongoDBName);
    }
    catch (error) {
        console.log(error);
        return;
    }
}
async function getCollection(name) {
    const db = await __1.database;
    if (!db)
        return null;
    return db.collection(name);
}
//# sourceMappingURL=db.js.map