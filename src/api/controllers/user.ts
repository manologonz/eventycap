import {Request, Response, NextFunction as Next} from "express";
import { validationResult } from "express-validator";
import {
    checkValidationErrors,
    isValidObjId,
    getUserFromRequest,
    sendResetPasswordMail, } from "../../utils/helpers"; import { JWT_SECRET } from "../../utils/constants";
import { HttpError } from "../../utils/types";
import User, {UserDocument, UserRole} from "../models/user";
import bcrypt from "bcryptjs";
import Token, {TokenType} from "../models/token";
import jwt from "jsonwebtoken";

type ResetPasswdTokenPayload = {
    _id: string;
}

type UserDetail = {
    username: string,
    firstName: string,
    lastName: string,
    role?: UserRole
    email?: string, verifiedEmail?: boolean,
    birthDate?: string,
}

async function validateUserPassword(user: UserDocument, password: string) {
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) throw new HttpError("wrong password", 400);
}

export async function userDetail(req: Request, res: Response, next: Next) {
    try {
        const userId = req.params.userId as string;
        isValidObjId([{id: userId, model: "user"}]);

        const user = await User.findOne({_id: userId}).lean();
        if(!user) throw new HttpError("user not found", 404);

        const data: UserDetail = {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        };

        const authUser = getUserFromRequest(req);

        if(authUser && authUser._id === user._id.toString()) {
            data["role"] = user.role;
            data["email"] = user.email;
            data["verifiedEmail"] = user.verifiedEmail;
            data["birthDate"] = user.birthDate;
        }

        res.json(data);
    } catch (error) {
        next(error);
    }
}

// TODO: add profile data endpoint
export async function userProfile(req: Request, res: Response, next: Next) {
    try {
        checkValidationErrors(validationResult(req));
        res.json("not supported yet");
    } catch (error) {
        next(error);
    }
}

export async function userUpdateInfo(req: Request, res: Response, next: Next) {
    try {
        const [userId] = isValidObjId([{id: req.params.userId, model: "user"}]);
        const user = await User.findOneAndUpdate(
            {_id: userId},
            {
                $set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    birthDate: req.body.birthDate,
                    role: req.body.role
                }
            },
            {new: true}
        );
        if(!user) throw new HttpError("user not found", 404);
        res.json({detail: "not supported yet"});
    } catch (error) {
        next(error);
    }
}


export async function changeEmail(req: Request, res: Response, next: Next) {
    try {
        res.json({detail: "not supported yet"});
    } catch (error) {
        next(error);
    }
}

export async function changeUsername(req: Request, res: Response, next: Next) {
    try {
        checkValidationErrors(validationResult(req));

        const [userId] = isValidObjId([{id: req.params.userId, model: "user"}]);
        const user = await User.findOne({_id: userId});
        if(!user) throw new HttpError("user not found", 404);

        await validateUserPassword(user, req.body.password);

        user.username = req.body.newUsername;
        await user.save();

        res.status(200).json({detail: "username changed"});
    } catch (error) {
        next(error);
    }
}

async function getUserFromResetToken(resetToken: string): Promise<UserDocument> {
    try {
        const {_id: userId}: ResetPasswdTokenPayload = jwt.decode(resetToken) as ResetPasswdTokenPayload;
        if(!userId) throw new HttpError("expired token", 400);

        const user = await User.findOne({_id: userId});
        if(!user) throw new HttpError("user not found", 400);

        const resetPasswdSecret = JWT_SECRET + user._id;

        jwt.verify(resetToken, resetPasswdSecret);

        return user;
    } catch(error) {
        if(error instanceof jwt.TokenExpiredError) throw new HttpError("expired token", 400);
        throw error;
    }
};


export async function resetPassword(req: Request, res: Response, next: Next) {
    try {
        checkValidationErrors(validationResult(req));
        const user = await getUserFromResetToken(req.query.token as string);
        user.password = await bcrypt.hash(req.body.newPassword, 12);
        await user.save();
        res.status(200).json({detail: "password changed"});
    } catch (error) {
        next(error);
    }
}

export async function changePassword(req: Request, res: Response, next: Next) {
    try {
        checkValidationErrors(validationResult(req));

        const user = await getUserFromResetToken(req.query.token as string);

        const isValid = bcrypt.compare(req.body.currentPassword, user.password);
        if(!isValid) throw new HttpError("wrong password", 400);

        user.password = await bcrypt.hash(req.body.newPassword, 12);
        await user.save();

        res.status(200).json({detail: "password changed"});
    } catch (error) {
        next(error);
    }
}

export async function requestChangePassword(req: Request, res: Response, next: Next) {
    try {
        checkValidationErrors(validationResult(req));
        const user = await User.findOne({email: req.body.email});
        if(user) {
            const resetSecret = JWT_SECRET + user._id;
            const token = jwt.sign({
                _id: user._id,
            }, resetSecret, {expiresIn: "2m"});

            await sendResetPasswordMail({
                toEmail: user.email,
                userId: user._id,
                resetToken: token
            });
        };
        res.status(200).json({});
    } catch (error) {
        next(error);
    }
}

export async function validateResetPasswordToken(req: Request, res: Response, next: Next) {
    try {
        const token = req.query.token as string;
        const {_id: userId}: ResetPasswdTokenPayload = jwt.decode(token) as ResetPasswdTokenPayload;
        const resetPasswdSecret = JWT_SECRET + userId;
        jwt.verify(token, resetPasswdSecret);
        res.status(200).json({detail: "valid token"});
    } catch (error) {
        next(new HttpError("expired token", 400));
    }
}