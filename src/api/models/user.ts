import {Schema, Document, Model, model, PopulatedDoc} from "mongoose";
import {JwtPayload} from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import {IEvent} from "./event";


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
    subscriptions: [
        {
            type: Schema.Types.ObjectId,
            ref: "Event"
        }
    ]
});

userShcema.virtual("fullname").get(function(this: UserDocument) {
    return `${this.firstName} ${this.lastName}`;
});

userShcema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
}

userShcema.statics.findUserAndValidatePassword = async function(
    passwd: string,
    email: string,
): Promise<UserDocument | null> {
    try {
        const user = await this.findOne({email});
        if(!user) return null
        const validPassword = await bcrypt.compare(passwd, user.password);
        if(!validPassword) return null;
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
    birthDate: string,
    subscriptions: PopulatedDoc<IEvent & Document>[]
}

export interface IAuthTokenPayload extends JwtPayload{
    _id: string,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    role: string
    verifiedEmail: boolean,
}
export interface UserBaseDocument extends IUser, Document {
    fullname: string;
    comparePassword(password: string): Promise<boolean>;
}

export interface UserDocument extends UserBaseDocument {

}

export interface UserModel extends Model<UserDocument> {
    findUserAndValidatePassword(passwd: string, email: string): Promise<UserDocument | null>;
}

export default model<UserDocument, UserModel>("User", userShcema);
