import { Request, Response, NextFunction } from "express";
export interface CreditsRequest extends Request {
    credits?: number;
}
export declare function processFile(req: CreditsRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=file-processor.middlewares.d.ts.map