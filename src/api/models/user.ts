import {Schema, Document, Model, model} from "mongoose";
import * as bcrypt from "bcryptjs";

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
    field: string,
    type: ValidationType
): Promise<UserDocument | null> {
    try {
        let userInfo;
        if(type === ValidationType.EMAIL) {
            userInfo = await this.findOne({email: field});
            console.log(field);
        } else if(type === ValidationType.USERNAME) {
            console.log("fetching email")
            userInfo = await this.findOne({username: field});
        }
        if(!userInfo) return null;
        console.log("fetching hashing")
        const validPassword = await bcrypt.compare(passwd, userInfo.password);
        if(!validPassword) return null;
        return userInfo;
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

export interface IUserTokenInfo {
    _id: string,
    username: string,
    firstName: string,
    lastName: string,
    role: string
    verifiedEmail: boolean,
}

export interface ITokenPayload extends IUserTokenInfo {
    iat: number,
    exp: number
}

export interface UserBaseDocument extends IUser, Document{
    fullname: string;
}

export interface UserDocument extends UserBaseDocument {

}

export interface UserModel extends Model<UserDocument> {
    findUserAndValidatePassword(passwd: string, field: string, type: ValidationType): Promise<UserDocument | null>;
}

export default model<UserDocument, UserModel>("User", userShcema);
