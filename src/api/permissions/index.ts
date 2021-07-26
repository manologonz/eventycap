import { Request, Response, NextFunction } from "express";
import { HttpError } from "../../utils/types";
import User, { IAuthTokenPayload, UserRole } from "../models/user";
import { JWT_SECRET } from "../../utils/constants";
import Event, { EventDocument } from "../models/event";
import * as jwt from "jsonwebtoken";
import { isValidObjId } from "../../utils/helpers";

function getTokenFromHeader(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.split(" ")[1]) {
        throw new HttpError("No authentication credentials found", 403);
    }
    return authHeader.split(" ")[1];
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    try {
        const token = getTokenFromHeader(req);
        const payload = jwt.verify(token, JWT_SECRET) as IAuthTokenPayload;
        req.user = payload;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            const expiredTokenError = new HttpError("token expired", 401);
            next(expiredTokenError);
        }
        next(new HttpError("Not authorized", 403));
    }
}

export function isUserCreator(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user || req.user.role !== UserRole[UserRole.CREATOR]) {
            throw new HttpError("Not Authorized", 403);
        }
        next();
    } catch (error) {
        next(error);
    }
}

interface IsUserOrOwnerParams {
    userId: string,
    eventId: string,

}

async function isUserEventOwnerOrAdmin(params: IsUserOrOwnerParams): Promise<boolean> {
    const { userId, eventId } = params;

    const event = await Event.findOne({ _id: eventId });
    if (!event) throw new HttpError("Event not found", 404);

    const existAdmin = event.administrators.find(
        (admin) => userId === admin.toString()
    );
    if (userId === event.creator.toString() || existAdmin) return true;

    return false;
}

export async function isEventOwnerOrAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = req.params.eventId;
        if (!req.user) throw new HttpError("Not Autorized", 403);
        const existsAdminOrEventOwner = await isUserEventOwnerOrAdmin({
            userId: req.user._id,
            eventId
        });
        if(existsAdminOrEventOwner) {
            next();
        }
    } catch (error) {
        next(error); }
}

export async function isSubscribedToEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const [eventId] = isValidObjId([{id: req.params.eventId, model: "event"}]);
        const event = await Event.findOne({ _id: eventId });

        if(req.user === null) throw new HttpError("Not Authorized", 400);

        if(!event) throw new HttpError("Event not found", 404);

        const subscriber = event.applicants.find(
            applicant => applicant.toString() === req.user!._id
        );

        if(!subscriber) throw new HttpError("you are not subscribed to event", 400);
        next();
    } catch (error) {
       next(error);
    }
}

export async function canSubscribeToEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = req.params.eventId;
        if(!req.user) throw new HttpError("Not Authorized", 403);

        const existsAdminOrEventOwner = await isUserEventOwnerOrAdmin({
            userId: req.user._id,
            eventId
        });

        if (existsAdminOrEventOwner) {
            throw new HttpError("You can't subscribte to event", 400);
        }

        next();
    } catch (error) {
        next(error);
    }
}