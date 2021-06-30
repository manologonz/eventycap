import { Request, Response, NextFunction } from "express";
import { getSecret } from "../utils/helpers";
import { HttpError } from "../utils/types";
import User, { ITokenPayload, UserRole } from "../models/user";
import Event from "../models/event";
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
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            const expiredTokenError = new HttpError("token expired", 403);
            next(expiredTokenError);
        }
        next(new HttpError("Not authorized", 403));
    }
}

export function isUserCreator(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.user && req.user.role !== UserRole[UserRole.CREATOR]) next();
        throw new HttpError("Not Authorized", 403);
    } catch (error) {
        next(error);
    }
}

export async function isEventOwnerOrAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = req.params.eventId;
        if (!req.user) throw new HttpError("Not Autorized", 403);
        const event = await Event.findOne({ _id: eventId });
        if(!event) throw new HttpError("Event not found", 404);
        const existAdmin = event.administrators.find((admin) => req.user!._id.toString() === admin.toString());
        if(req.user._id === event.creator.toString() || existAdmin) {
            next();
        }
    } catch (error) {
        next(error);
    }
}
// TODO: Add Subscribers model validation
export async function isSubscribedToEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = req.params.eventId;
        if(!req.user) throw new HttpError("Not Authorized", 400);
        const event = await Event.findOne({ _id: eventId });
        if(!event) throw new HttpError("Event not found", 404);
        next();
    } catch (error) {
       next(error);
    }
}