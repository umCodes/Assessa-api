import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/auth-handler.middlewares";
import { CreditsRequest } from "../middlewares/file-processor.middlewares";
export declare function clearUpPaper(req: AuthRequest & CreditsRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=clear-up.controllers.d.ts.map