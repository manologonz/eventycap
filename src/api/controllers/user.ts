import {Request, Response, NextFunction as Next} from "express";
import { validationResult } from "express-validator";
import {
    checkValidationErrors,
    isValidObjId,
    getUserFromRequest,
    sendResetPasswordMail,
    sendEmailVerificationMail
} from "../../utils/helpers";
import { JWT_SECRET } from "../../utils/constants";
import { HttpError } from "../../utils/types";
import User, {UserDocument, UserRole} from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * FILE TYPES
 */
type UpdateTokenPayload = {
    _id: string;
    type: "EMAIL_CONFIRMATION" | "PASSWORD_RESET"
}

type UserDetail = {
    username: string,
    firstName: string,
    lastName: string,
    role?: UserRole
    email?: string, verifiedEmail?: boolean,
    birthDate?: string,
}

/**
 * UTILS
 */

async function validateUserPassword(user: UserDocument, password: string) {
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) throw new HttpError("wrong password", 400);
}

async function getUserFromToken(resetToken: string): Promise<UserDocument> {
    try {
        const {_id: userId, type}: UpdateTokenPayload = jwt.decode(resetToken) as UpdateTokenPayload;
        if(!userId || !type) throw new HttpError("expired token", 400);

        const user = await User.findOne({_id: userId});
        console.log("something")
        if(!user) throw new HttpError("user not found", 400);

        let secret = JWT_SECRET + user._id;

        if(type === "EMAIL_CONFIRMATION")
            secret = JWT_SECRET + user.email;

        jwt.verify(resetToken, secret);

        return user;
    } catch(error) {
        if (error instanceof jwt.TokenExpiredError)
            throw new HttpError("expired token", 400);
        throw error;
    }
};


/**
 * USER DATA RETRIEVE ENDPOINTS
 */
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

/**
 * USER DATA MANAGEMENT
 */
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


export async function sendVerificationEmail(req: Request, res: Response, next: Next) {
    try {
        if(!req.user) throw new HttpError("user not found", 404);
        const user = await User.findOne({_id: req.user._id});
        console.log(user)

        if(req.user.verifiedEmail)
            throw new HttpError("email already verified", 400);

        const emailVerificationSecret = JWT_SECRET + req.user.email;

        const verificationToken = jwt.sign({
            _id: req.user._id,
            type: "EMAIL_CONFIRMATION"
        }, emailVerificationSecret);

        sendEmailVerificationMail({
            toEmail: req.user.email,
            token: verificationToken
        });

        res.json({detail: "verification email sent"});
    } catch (error) {
        next(error);
    }
}


export async function emailConfirmation(req: Request, res: Response, next: Next) {
    try {
        const user = await getUserFromToken(req.query.token as string);
        if(user.verifiedEmail) throw new HttpError("invalid token", 400);
        user.verifiedEmail = true;
        await user.save();
        res.json({detail: "email confirmated"});
    } catch (error) {
        next(error);
    }
}

export async function changeEmail(req: Request, res: Response, next: Next) {
    try {
        checkValidationErrors(validationResult(req));

        const [userId] = isValidObjId([{id: req.params.userId, model: "user"}]);

        let user = await User.findOne({_id: userId});
        if(!user) throw new HttpError("user not found", 404);

        await validateUserPassword(user, req.body.password);

        if(req.body.newEmail === user.email)
            throw new HttpError("new email is the current email, it will not be updated.", 400);

        user.email = req.body.newEmail;
        user.verifiedEmail = false;
        user = await user.save();

        const emailVerificationSecret = JWT_SECRET + user.email;

        const verificationToken = jwt.sign({
            _id: user._id,
            type: "EMAIL_CONFIRMATION"
        }, emailVerificationSecret, {expiresIn: "1d"});

        sendEmailVerificationMail({
            toEmail: req.body.newEmail,
            token: verificationToken
        });

        res.json({detail: "email change, confirm email"});
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

export async function changePassword(req: Request, res: Response, next: Next) {
    try {
        checkValidationErrors(validationResult(req));

        const user = await getUserFromToken(req.query.token as string);

        const isValid = bcrypt.compare(req.body.currentPassword, user.password);
        if(!isValid) throw new HttpError("wrong password", 400);

        user.password = await bcrypt.hash(req.body.newPassword, 12);
        await user.save();

        res.status(200).json({detail: "password changed"});
    } catch (error) {
        next(error);
    }
}

/**
 * PASSWORD RESET ENDPOINTS
 */

// Reset password through email
export async function resetPassword(req: Request, res: Response, next: Next) {
    try {
        checkValidationErrors(validationResult(req));
        const user = await getUserFromToken(req.query.token as string);
        user.password = await bcrypt.hash(req.body.newPassword, 12);
        await user.save();
        res.status(200).json({detail: "password changed"});
    } catch (error) {
        next(error);
    }
}

// Sends reset email
export async function requestChangePassword(req: Request, res: Response, next: Next) {
    try {
        checkValidationErrors(validationResult(req));
        const user = await User.findOne({email: req.body.email});
        if(user && user.verifiedEmail) {
            const resetSecret = JWT_SECRET + user._id;
            const token = jwt.sign({
                _id: user._id,
            }, resetSecret, {expiresIn: "2m"});

            await sendResetPasswordMail({
                toEmail: user.email,
                token: token
            });
        } else if(user && !user.verifiedEmail) {
            throw new HttpError("email not verified", 400);
        }

        res.status(200).json({});
    } catch (error) {
        next(error);
    }
}

// Endpoint validates if the token is expired (for frontend functionalitiy)
export async function validateResetPasswordToken(req: Request, res: Response, next: Next) {
    try {
        const token = req.query.token as string;
        const {_id: userId, type}: UpdateTokenPayload = jwt.decode(token) as UpdateTokenPayload;
        const resetPasswdSecret = JWT_SECRET + userId;
        jwt.verify(token, resetPasswdSecret);
        if(type !== "PASSWORD_RESET") throw new HttpError("invalid token", 400);
        res.status(200).json({detail: "valid token"});
    } catch (error) {
        next(new HttpError("expired token", 400));
    }
}