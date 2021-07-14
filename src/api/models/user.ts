import {Schema, Document, Model, model} from "mongoose";
import {JwtPayload} from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { HttpError } from "../utils/types";

const userShcema = new Schema<UserDocument, UserModel>({
    username: { type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    role: {
        type: Number,
        enum: [0, 1],
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
    },
    verifiedEmail: {
        type: Boolean,
        default: false,
    },
    birthDate: {
        type: String,
        required: true,
    },
});

userShcema.virtual("fullname").get(function(this: UserDocument) {
    return `${this.firstName} ${this.lastName}`;
});

userShcema.statics.findUserAndValidatePassword = async function(
    passwd: string,
    email: string,
): Promise<UserDocument | null> {
    try {
        const user = await this.findOne({email});
        if(!user) throw new HttpError("wrong username or password", 400);
        const validPassword = await bcrypt.compare(passwd, user.password);
        if(!validPassword) throw new HttpError("wrong username or password", 400);
        return user;
    } catch(err) {
        return null;
    }
}

export enum UserRole {
    CLIENT = 0,
    CREATOR = 1
}

export enum ValidationType {
    USERNAME = 1,
    EMAIL
}

export interface IUser {
    username: string,
    firstName: string,
    lastName: string,
    role: UserRole
    email: string,
    password: string,
    verifiedEmail: boolean,
    birthDate: string
}

export interface IAuthTokenPayload extends JwtPayload{
    _id: string,
    username: string,
    firstName: string,
    lastName: string,
    role: string
    verifiedEmail: boolean,
}
export interface UserBaseDocument extends IUser, Document{
    fullname: string;
}

export interface UserDocument extends UserBaseDocument {

}

export interface UserModel extends Model<UserDocument> {
    findUserAndValidatePassword(passwd: string, email: string): Promise<UserDocument>;
}

export default model<UserDocument, UserModel>("User", userShcema);
