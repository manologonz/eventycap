import { Document, Model, model, PopulatedDoc, Schema} from "mongoose";
import {IUser, UserDocument, UserModel} from "./user";

const tokenSchema = new Schema<TokenDocument, TokenModel>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: Number,
        enum: [1, 2],
        required: true
    }
});

export enum TokenType {
    PASSWORD_RESET = 1,
    EMAIL_CHANGE = 2
}

export interface IToken {
    user: PopulatedDoc<Document & IUser>;
    token: string;
    type: TokenType
}

export interface TokenBaseDocument extends IToken, Document {

}

export interface TokenDocument extends TokenBaseDocument {

}

export interface TokenModel extends Model<TokenDocument> {

}

export default model<TokenDocument, TokenModel>("Token", tokenSchema);