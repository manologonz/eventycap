import {Types} from "mongoose";
import {Request, Response, NextFunction as Next} from "express";
import { Result } from "express-validator";
import User, { UserDocument, IAuthTokenPayload, UserRole} from "../api/models/user";
import Event, { EventFilter } from "../api/models/event";
import {
    JWT_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    SENDGRID_API_KEY,
} from "./constants";
import { AuthTokens, HttpError, ValidationErrors} from "./types";
import { TokenBasedMailParams } from "./constants";
import { CustomValidator } from "express-validator";
import sendgridEmailHandler, {MailDataRequired} from "@sendgrid/mail";
import moment from "moment";
import jwt from "jsonwebtoken";

// custom validators
export const matchingPasswords: CustomValidator = (input, {req}) => {
    if(input !== req.body.newPassword) throw new HttpError("passwords don't match", 400);
    return true;
}

export function checkValidationErrors(result: Result) {
    const errors: ValidationErrors = {};
    if (!result.isEmpty()) {
        result.array().forEach(({ msg, param }) => {
            if (!!errors[param]) {
                errors[param] = [...errors[param], msg];
            } else {
                errors[param] = [msg];
            }
        });
        throw new HttpError("Validation failed", 400, true, errors);
    }
}

export function createTokens(user: UserDocument): AuthTokens {
    // access_token creation
    const accessTokenSignOpts = {
        expiresIn: `${ACCESS_TOKEN_EXPIRY}m`
    };

    const tokenPayload: IAuthTokenPayload = {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: UserRole[user.role],
        verifiedEmail: user.verifiedEmail
    }

    const new_access_token = jwt.sign(
        tokenPayload,
        JWT_SECRET,
        accessTokenSignOpts
    );
    const access_token_expiry = moment()
        .add(ACCESS_TOKEN_EXPIRY, "minutes")
        .utcOffset("GMT")
        .toDate();

    // refresh_token creation
    const refreshTokenSignOpts = {
        expiresIn: `${REFRESH_TOKEN_EXPIRY}d`
    };
    const new_refresh_token = jwt.sign(
        {_id: user._id},
        JWT_SECRET + user.password,
        refreshTokenSignOpts
    );
    const refresh_token_expiry = moment()
        .add(REFRESH_TOKEN_EXPIRY, "days")
        .utcOffset("GMT")
        .toDate();

    return {
        new_access_token,
        new_refresh_token,
        refresh_token_expiry,
        access_token_expiry
    }
}

type RefreshTokenPayload = {
    _id: string;
} | null

export async function refreshTokens(refresh_token: string): Promise<AuthTokens | null> {
    let tokenPayload: RefreshTokenPayload;
    try {
        tokenPayload = jwt.decode(refresh_token) as RefreshTokenPayload;
    } catch(err) { return null;
    }

    if(!tokenPayload) return null;

    const user = await User.findOne({_id: tokenPayload._id});
    if(!user) return null;

    try {
        return createTokens(user);
    } catch(err) {
        return null;
    }
}

export function bodyToJSON(req: Request, res: Response, next: Next) {
    try {
        const input = JSON.parse(req.body.data);
        req.body = input;
        next();
    } catch(error) {
        next(new HttpError("wrong data format", 400));
    }
}

type IDParam = {
    id: string,
    model: string
}

export function isValidObjId(idParams: IDParam[]): string[] {
    idParams.forEach(({id, model}) => {
        if(!Types.ObjectId.isValid(id)) {
            throw new HttpError(`${model} not found`, 404);
        }
    });

    return idParams.map(({id}) => id);
}

export function buildEventFilter(req: Request): EventFilter {
    const filter: EventFilter = {
        isPublished: true
    };

    if(req.query.name) {
        filter["name"] = {$regex: `${req.query.name}`, $options: "i"};
    }

    if(req.query.creator) {
        filter["creator"] = req.query.creator as string;
    }

    if(req.query.category) {
        filter["category"] = req.query.category as string;
    }

    if(req.query.date) {
        filter["date"] = new Date(req.query.date as string);
    }

    if(req.query.place) {
        filter["place"] = req.query.place as string;
    }

    if(req.query.limit) {
        filter["limit"] = parseInt(req.query.limit as string);
    }

    if(req.query.free === "true") {
        filter["isFree"] = true;
    } else if(req.query.false === "false") {
        filter["isFree"] = false;
    }

    if(req.query.price) {
        filter["price"] = parseFloat(req.query.price as string);
    }

    return filter;
}

export interface IsUserOrOwnerParams {
    userId: string,
    eventId: string,
}

export async function isUserEventOwnerOrAdmin(params: IsUserOrOwnerParams): Promise<boolean> {
    const { userId, eventId } = params;

    const event = await Event.findOne({ _id: eventId });
    if (!event) throw new HttpError("Event not found", 404);

    const existAdmin = event.administrators.find(
        (admin) => userId === admin.toString()
    );
    if (userId === event.creator.toString() || existAdmin) return true;

    return false;
}

export type UserInformationInEvent = {
    username: string,
    fullName: string
}

export function getPopulatedAdminsInEvent(admins: UserDocument[]): UserInformationInEvent[] {
    return admins.map((admin) => ({
            username: admin.username,
            fullName: `${admin.firstName} ${admin.lastName}`
        }
    ));
};

export function getPopulatedCreatorInEvent(creator: UserDocument): UserInformationInEvent {
    return {
        username: creator.username,
        fullName: `${creator.firstName} ${creator.lastName}`
    };
}

export function getUserFromRequest(req: Request): IAuthTokenPayload | null {
    const token = req.headers.authorization as string;
    if(!token || !token.split(" ")[1]){
        return null;
    }
    try {
        const payload = jwt.verify(token.split(" ")[1], JWT_SECRET) as IAuthTokenPayload;
        return payload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new HttpError("token expired", 401);
        }
       return null;
    }
}

export async function sendMail(mailData: MailDataRequired) {
        sendgridEmailHandler.setApiKey(SENDGRID_API_KEY);
        const response = await sendgridEmailHandler.send(mailData);
}

export async function sendResetPasswordMail(data: TokenBasedMailParams) {
    try {
        const {toEmail, token} = data;
        const link = `http://localhost:5000/reset-password?token=${token}`;
        const options = {
            to: toEmail,
            from: "service@senderemailtest.xyz",
            subject: "Password Reset",
            html: `<p>reset password email, backend link: ${link} </p>`
        }
        await sendMail(options);
    } catch(error) {
        // TODO: add error handling
    }
}

export async function sendEmailVerificationMail(data: TokenBasedMailParams) {
    try {
        const {toEmail, token} = data;
        const link = `http://localhost:5000/email-confirmation?token=${token}`;
        const options = {
            to: toEmail,
            from: "service@senderemailtest.xyz",
            subject: "Email confirmation",
            html: `<p>email confirmation, backend link: ${link} </p>`
        }
        await sendMail(options);
    } catch(error) {
        // TODO: add error handling
    }
}