import {Types} from "mongoose";
import {Request, Response, NextFunction as Next} from "express";
import { Result } from "express-validator";
import User, { UserDocument, IAuthTokenPayload, UserRole} from "../api/models/user";
import { JWT_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "./constants";
import { AuthTokens, HttpError } from "./types";
import { ValidationErrors } from "./types";
import moment from "moment";
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

export function createTokens(user: UserDocument): AuthTokens {
    // access_token creation
    const accessTokenSignOpts = {
        expiresIn: `${ACCESS_TOKEN_EXPIRY}m`
    };

    const tokenPayload: IAuthTokenPayload = {
        _id: user._id,
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
    } catch(err) {
        return null;
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