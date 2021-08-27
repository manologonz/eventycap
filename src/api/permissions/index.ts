import { Request, Response, NextFunction } from "express";
import { HttpError } from "../../utils/types";
import User, { IAuthTokenPayload, UserRole } from "../models/user";
import { JWT_SECRET } from "../../utils/constants";
import Event, { EventDocument } from "../models/event";
import * as jwt from "jsonwebtoken";
import { isValidObjId, isUserEventOwnerOrAdmin, IsUserOrOwnerParams} from "../../utils/helpers";

function getTokenFromHeader(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.split(" ")[1]) {
        throw new HttpError("No authentication credentials found", 403);
    }
    return authHeader.split(" ")[1];
}

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    try {
        const token = getTokenFromHeader(req);
        const payload = jwt.verify(token, JWT_SECRET) as IAuthTokenPayload;
        const user = await User.findOne({_id: payload._id});

        if(!user) throw new HttpError("not authorized", 403);

        req.user = {
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            verifiedEmail: user.verifiedEmail,
            role: UserRole[user.role]
        };
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

export async function isAccountOwner(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.userId as string;
        console.log(userId, req.user?._id);
        isValidObjId([{id: userId, model: "user"}]);
        if(req.user && req.user._id.toString() === userId.toString()) {
            next();
        } else {
            throw new HttpError("Not Authorized", 403);
        }
    } catch(error) {
        next(error);
    }
}