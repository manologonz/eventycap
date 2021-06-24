import {Document, Model, model, Schema, ObjectId, PopulatedDoc} from "mongoose";
import {IUser} from "./user";

const refreshTokenSchema = new Schema<RefreshTokenDocument, RefreshTokenModel>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expires_at: {
        type: Date,
        required: true,
        unique: true
    }
});

export interface IRefreshToken {
    user: PopulatedDoc<IUser & Document>,
    token: string,
    expires_at: Date
}

export interface RefreshTokenBaseDocument extends IRefreshToken, Document {
}

export interface RefreshTokenDocument extends RefreshTokenBaseDocument {
}

export interface RefreshTokenPopulatedDocument extends RefreshTokenBaseDocument {
    user: IUser;
}

export interface RefreshTokenModel extends Model<RefreshTokenDocument> {

}

export default model<RefreshTokenDocument, RefreshTokenModel>("AuthToken", refreshTokenSchema);
