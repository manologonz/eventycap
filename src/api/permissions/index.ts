import {Request, Response, NextFunction} from "express";
import { getSecret } from "../utils/helpers";
import { HttpError } from "../utils/types";
import { ITokenPayload } from "../models/user";
import * as jwt from "jsonwebtoken";

function getTokenFromHeader(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.split(" ")[1]) {
        throw new HttpError("No authentication credentials found", 401);
    }
    return authHeader.split(" ")[1];
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    try {
        const token = getTokenFromHeader(req);
        const secret = getSecret();
        const payload = jwt.verify(token, secret) as ITokenPayload;
        req.user = payload;
        next();
    } catch(error) {
        if(error instanceof jwt.TokenExpiredError) {
            const expiredTokenError = new HttpError("token expired", 403);
            next(expiredTokenError);
        }
        next(new HttpError("Not authorized", 403));
    }
}
