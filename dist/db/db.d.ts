import { ObjectId } from 'mongodb';
export declare function connectToDB(): Promise<void | import("mongodb").Db>;
export declare function getCollection<T>(name: string): Promise<import("mongodb").Collection<T & {
    _id?: ObjectId;
}> | null>;
//# sourceMappingURL=db.d.ts.map