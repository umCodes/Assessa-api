import { NextFunction, Request, Response } from "express";
export declare function storeTokensInCookies(res: Response, tokens: {
    access?: string;
    refresh?: string;
}, uid: string): Promise<void>;
export declare function hashToken(token: string, secret: string): string;
export declare function compareTokens(token1: string, token2: string): boolean;
export declare function clearDBRefreshToken(uid: string, refreshToken: string): Promise<void>;
export declare function verifyTokens(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=tokens.d.ts.map