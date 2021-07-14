import {Request, Response, NextFunction, CookieOptions} from "express";
import User, { UserRole, IUser, IAuthTokenPayload} from "../models/user";
import { checkValidationErrors, createTokens } from "../utils/helpers";
import { validationResult } from "express-validator";
import RefreshToken, { RefreshTokenDocument } from "../models/refreshtoken";
import {HttpError} from "../utils/types";
import {addDaysToDate} from "../utils/helpers";
import { JWT_TOKEN_EXPIRES, JWT_SECRET, REFRESH_TOKEN_EXPIRES } from "../utils/constants";
import {v4 as uuid} from "uuid";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

type CookieParams = [string, string, CookieOptions];

async function createUniqueRefreshToken(): Promise<string> {
    /**
     * * Validates that the token generated does not
     * * exists in the database already.
     */
    let refresh_token: RefreshTokenDocument | null;
    let _refresh_token: string;
    while(true) { _refresh_token = uuid();
        refresh_token = await RefreshToken.findOne({token: _refresh_token});
        if(!refresh_token) break;
    }
    return _refresh_token;
}

function getCookieParams(refresh_token: string, deleteToken: boolean = false): CookieParams {
    /**
     * * Gives the necesary parameters to create the refresh_token cookie.
     * ? if delteToken set to true, the return values are the parameters to
     * ? delete the refresh token from the cookies (logout).
     *
     * ? if deleteToken not given, the return values are the refresh_token,
     * ? and the cookie configurations.
     */
    let expires = new Date();
    expires = addDaysToDate(15, expires);
    return deleteToken ? ["refresh_token", "", {httpOnly: true}]
    : ["refresh_token", refresh_token, {maxAge: 86_400_00, httpOnly: true, expires}];
}

function getTokenOptions(): jwt.SignOptions {
    // * Centralized configurations for the jwt SignOptions object.
    return {
        expiresIn: `${JWT_TOKEN_EXPIRES}m`
    }
}

async function registerRefreshToken(user: string): Promise<RefreshTokenDocument> {
    // * Creates a new refresh token on database.
    await RefreshToken.deleteOne({user: user});
    const refresh_token = await createUniqueRefreshToken();
    const _expire = new Date(new Date().getTime() + (REFRESH_TOKEN_EXPIRES * 60 * 1000));
    const newToken = new RefreshToken({user, token: refresh_token, expires_at: _expire});
    await newToken.save();
    return newToken;
}

// TODO: finish token genearation, move createTokens function to helpers folder.
export async function login(req: Request, res: Response, next: NextFunction) {
    try{
        checkValidationErrors(validationResult(req)); // request data validation
    const user = await User.findUserAndValidatePassword(req.params.password, req.params.email);
        const {
            new_access_token,
            new_refresh_token,
            refresh_cookie_expiry,
            access_token_expiry
        } = await createTokens(user);
        res.json({
            user,
            acess_token: new_access_token,
            refresh_token: new_refresh_token,
            access_token_expiry
        });
    } catch(error) {
        next(error);
    }
}

export async function register(req: Request, res: Response, next: NextFunction) {
    try{
        checkValidationErrors(validationResult(req)); // request data validation
        const userData: IUser = {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            role: req.body.role,
            password: await bcrypt.hash(req.body.password, 12),
            email: req.body.email,
            verifiedEmail: false,
            birthDate: req.body.birthDate
        }
        let user = new User(userData);
        user = await user.save();
        res.json({
            _id: user._id,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: UserRole[userData.role],
            verifiedEmail: userData.verifiedEmail,
            birthDate: userData.birthDate
        });
    } catch(error) {
        next(error);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        res.clearCookie("refresh_token");
        res.status(204).json();
    } catch (error) {
        next(error);
    }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
    /**
     * * Generates a new jwt_token and refresh_token for the client
     * * if the given refresh_token is valid.
     */
    try {
        // validating refresh token
        const token = req.cookies.refresh_token;
        let refresh_token = await RefreshToken.findOne({token}).populate("user");
        if(!refresh_token) throw new HttpError("Not authenticated", 403);

        // creating a new JWT token
        const options = getTokenOptions();
        const jwtTokenInfo: IAuthTokenPayload = {
            _id: refresh_token.user._id,
            username: refresh_token.user.username,
            firstName: refresh_token.user.firstName,
            lastName: refresh_token.user.lastName,
            verifiedEmail: refresh_token.user.verifiedEmail,
            role: UserRole[refresh_token.user.role]
        }
        const newToken = jwt.sign(jwtTokenInfo, JWT_SECRET, options);

        // creating a new refresh token
        await RefreshToken.findOneAndDelete({token});
        const new_refresh_token = await registerRefreshToken(jwtTokenInfo._id);

        // sending response
        const params = getCookieParams(new_refresh_token.token);
        const _expire = new Date(new Date().getTime() + (REFRESH_TOKEN_EXPIRES * 60 * 1000));
        res.cookie(...params);
        res.json({token: newToken, token_expiry: _expire});
    } catch(error) {
        next(error);
    }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
    try {
        if(!req.user) throw new HttpError("Not Authorized", 403);
        res.json({
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            verifiedEmal: req.user.verifiedEmail,
            role: req.user.role
        });
    } catch (error) {
        next(error);
    }
}