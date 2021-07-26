import { Request, Response, NextFunction, CookieOptions } from "express";
import User, { UserRole, IUser, IAuthTokenPayload } from "../models/user";
import {
    checkValidationErrors,
    createTokens,
    refreshTokens,
} from "../../utils/helpers";
import { validationResult } from "express-validator";
import { HttpError } from "../../utils/types";
import * as bcrypt from "bcryptjs";

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        checkValidationErrors(validationResult(req)); // request data validation
        const user = await User.findUserAndValidatePassword(
            req.body.password,
            req.body.email
        );
        if(!user) throw new HttpError("wrong username or password", 400);
        const {
            new_access_token: access_token,
            new_refresh_token,
            refresh_token_expiry,
            access_token_expiry,
        } = createTokens(user);
        res.cookie("refresh_token", new_refresh_token, {
            httpOnly: true,
            expires: refresh_token_expiry,
        });
        res.json({
            access_token,
            access_token_expiry,
        });
    } catch (error) {
        next(error);
    }
}

export async function register(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        checkValidationErrors(validationResult(req)); // request data validation
        const userData: IUser = {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            role: req.body.role,
            password: await bcrypt.hash(req.body.password, 12),
            email: req.body.email,
            verifiedEmail: false,
            birthDate: req.body.birthDate,
            subscriptions:[]
        };
        let user = new User(userData);
        user = await user.save();
        res.json({
            _id: user._id,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: UserRole[userData.role],
            verifiedEmail: userData.verifiedEmail,
            birthDate: userData.birthDate,
        });
    } catch (error) {
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

export async function refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    /**
     * * Generates a new jwt_token and refresh_token for the client
     * * if the given refresh_token is valid.
     */
    try {
        // validating refresh token
        const _refresh_token: string | null = req.cookies["refresh_token"];
        if (!_refresh_token) {
            throw new HttpError("Not Authenticated", 403);
        }
        //creating token
        const tokens = await refreshTokens(_refresh_token);
        if (!tokens) throw new HttpError("Not Authenticated", 403);
        const {
            new_access_token,
            new_refresh_token,
            access_token_expiry,
            refresh_token_expiry,
        } = tokens;
        res.cookie("refresh_token", new_refresh_token, {
            httpOnly: true,
            expires: refresh_token_expiry,
        });
        res.json({
            new_access_token,
            access_token_expiry,
        });
    } catch (error) {
        next(error);
    }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new HttpError("Not Authorized", 403);
        res.json({
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            verifiedEmal: req.user.verifiedEmail,
            role: req.user.role,
        });
    } catch (error) {
        next(error);
    }
}
