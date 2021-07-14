import { Result } from "express-validator";
import { UserDocument, IAuthTokenPayload, UserRole} from "../models/user";
import { JWT_SECRET, JWT_TOKEN_EXPIRES } from "./constants";
import { AuthTokens, HttpError } from "../utils/types";
import { ValidationErrors } from "../utils/types";
import jwt from "jsonwebtoken";

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

export function addDaysToDate(days: number, date: Date): Date {
    let newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}

export function createTokens(user: UserDocument): AuthTokens {
    // access_token creation.
    const accessTokenSignOpts = {expiresIn: "5m"};
    const tokenInfo: IAuthTokenPayload = {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: UserRole[user.role],
        verifiedEmail: user.verifiedEmail
    }

    const new_access_token = jwt.sign(
        tokenInfo,
        JWT_SECRET,
        accessTokenSignOpts
    );
    const access_token_expiry = addDaysToDate(1, new Date());

    // refresh_token creation
    const refreshTokenSignOpts = {expiresIn: "2d"};
    const new_refresh_token = jwt.sign(
        {_id: user._id},
        JWT_SECRET + user.password,
        refreshTokenSignOpts
    );

    return {
        new_access_token,
        new_refresh_token,
        refresh_cookie_expiry: new Date(),
        access_token_expiry
    }
}