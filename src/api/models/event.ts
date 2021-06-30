import {Schema, ObjectId, Document, Model, model, PopulatedDoc} from "mongoose";
import {IUser} from "./user";


const eventSchema = new Schema<EventDocument, EventModel>({
    name: {
        type: String,
        requiered: true,
    },
    banner: {
        type: String,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User", required: true
    },
    administrators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    category: String,
    tags: [{ type: String }],
    date: {
        type: String,
        required: true,
    },
    place: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    applicants: {
        type: Schema.Types.ObjectId,
        ref: "AplicantsGroup",
    },
    limit: {
        type: Number,
        required: true,
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isFree: {
        type: Boolean,
        default: true,
    },
    price: {
        type: Number,
    },
});

export interface IEvent {
    name: string;
    banner: string;
    creator: IUser | ObjectId;
    administrators: IUser[] | ObjectId[];
    category: string;
    tags: string[];
    date: Date;
    place: string,
    description: string,
    applicants: IUser[] | ObjectId[];
    limit: number,
    isPublished: boolean,
    isFree: boolean,
    price: number,
}

export interface EventBaseDocument extends IEvent, Document {

}

// TODO change applicats IUser for the IApplicanst model interface
export interface EventDocument extends EventBaseDocument {
    creator: PopulatedDoc<IUser & Document>;
    administrators: PopulatedDoc<IUser & Document>[],
    applicants: PopulatedDoc<IUser & Document>[];
}
export interface EventModel extends Model<EventDocument> {

}

export default model<EventDocument, EventModel>("Event", eventSchema);
