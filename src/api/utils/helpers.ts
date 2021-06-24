import {Response, Request, NextFunction} from "express";
import { Result } from "express-validator";
import { HttpError, Endpoint } from "../utils/types";
import { ValidationErrors, LoginObject } from "../utils/types";
import {usernameLogin, emailLogin} from "../controllers/auth";
import {emailLoginValidator, usernameLoginValidator} from "../validators/auth";
import {ValidationChain} from "express-validator";
import RefreshToken, { RefreshTokenDocument } from "../models/refreshtoken";
import {v4 as uuid}  from "uuid";

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

export const LoginChooser = new LoginObject();

export function getLoginEndpoint(): Endpoint {
    if (LoginChooser.isEmailLogin()) {
        return emailLogin;
    } else if (LoginChooser.isUsernameLogin()) {
        return usernameLogin;
    } else {
        return async (req: Request, res: Response, next: NextFunction) => {
            res.json({ detail: "Can't select correct endpoint" });
        };
    }
}

export function getLoginValidators(): ValidationChain[] | [] {
    if(LoginChooser.isEmailLogin()) {
        return emailLoginValidator();
    } else if(LoginChooser.isUsernameLogin()) {
        return usernameLoginValidator();
    }
    return [];
}

export function getSecret(): string {
    return process.env.JWT_SECRET || "sup3rs3cr3tstring123";
}

export function getTokenExpire(): number {
    let expires = process.env.TOKEN_EXPIRES;
    if(expires) {
        return parseInt(expires);
    }
    return 15;
}

export function addDaysToDate(days: number, date: Date): Date {
    let newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}