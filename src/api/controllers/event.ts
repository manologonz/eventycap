import {Request, Response, NextFunction} from "express";
import Event, {IEvent, EventDocument} from "../models/event";
import User, { UserRole } from "../models/user";
import { IMAGE_URL } from "../../utils/constants";
import {validationResult} from "express-validator";
import {buildEventFilter,
    checkValidationErrors,
    isValidObjId,
    getPopulatedAdminsInEvent,
    getPopulatedCreatorInEvent,
    UserInformationInEvent,
    isUserEventOwnerOrAdmin,
} from "../../utils/helpers";
import { HttpError } from "../../utils/types";
import paginate from "express-paginate";
import fs from "fs";
import path from "path";

function getValidatedId(req: Request): string {
    const _id = req.params.eventId as string;
    isValidObjId([{id: _id, model: "event"}]);
    return _id;
}

// TODO: change place field with coordenates using goole maps frontend component
export async function createEvent(req: Request, res: Response, next: NextFunction) {
    try {
        if(!req.user) throw new HttpError("Not Authenticated", 403);

        checkValidationErrors(validationResult(req));

        if(!req.file) {
            throw new HttpError("[banner] is a required field", 400);
        }

        const event:IEvent = {
            banner: `${req.protocol}://${req.get("host")}/${IMAGE_URL}/${req.user._id}/${req.file.filename}`,
            name: req.body.name,
            category: req.body.category,
            tags: req.body.tag ? req.body.tag : [],
            date: req.body.date,
            place: req.body.place,
            description: req.body.description,
            limit: req.body.limit,
            isFree: req.body.free,
            creator: req.user._id,
            administrators: [],
            applicants: [],
            isPublished: true
        };

        if(req.body.price) event.price = req.body.price;

        let newEvent = new Event(event);
        newEvent = await newEvent.save();

        res.status(200).json({
            _id: newEvent._id,
            name: newEvent.name
        });
    } catch(err) {
        if(req.file) {
            fs.unlinkSync(path.join(`${req.file.destination}/${req.file.filename}`));
        }
        next(err);
    }
}

export async function listEvents(req: Request, res: Response, next: NextFunction) {
    try {
        const limit = parseInt(req.query.limit as string, 10);
        const skip = req.skip || 0;
        const currentPage = parseInt(req.query.page as string, 10);
        const filter = buildEventFilter(req);

        const count = await Event.find(filter).countDocuments({});
        const result = await Event.find(filter).limit(limit).skip(skip).lean().exec();
        const pageCount = Math.ceil(count/limit);
        let next: string | boolean = paginate.hasNextPages(req)(pageCount);

        if(next) {
            next = `${req.protocol}://${req.get("host")}/${req.url}?page=${currentPage + 1}`;
        }

        res.status(200).json({
            count,
            next,
            result
        });
    } catch(err) {
        next(err);
    }
}

export async function addAdminToEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const _id = getValidatedId(req);
        checkValidationErrors(validationResult(req));
        const event = await Event.findOneAndUpdate(
            {_id},
            {
                $addToSet: {
                    administrators: req.body.administrators
                }
            });
        if(!event) throw new HttpError("Event not found", 404);
        res.status(200).json({detail: "Administrator(s) added successfully"});
    } catch (error) {
       next(error);
    }
}

export async function removeAdminFromEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = getValidatedId(req);
        let [adminId] = isValidObjId([{id: req.params.adminId, model: "user"}]);


        const event = await Event.findOneAndUpdate(
            { _id: eventId },
            {
                $pull: {
                    administrators: adminId
                },
            },
            {
                new: true,
            }
        );

        if(!event) throw new HttpError("event not found", 404);

        res.status(200).json({detail: "Administrator removed successfully"});
    } catch (error) {
        next(error);
    }
}

export async function subscribeToEvent(req: Request, res: Response, next: NextFunction) {
    try {
        if(!req.user) throw new HttpError("Not Authorized", 403);

        const _id = getValidatedId(req);

        const event = await Event.findOneAndUpdate(
            {_id},
            {
                $addToSet: {
                    applicants: req.user._id
                }
            });

        if(!event) throw new HttpError("Event not found", 404);


        await User.findOneAndUpdate(
            { _id: req.user._id },
            {
                $addToSet: {
                    subscriptions: event._id,
                },
            }
        );

        res.status(200).json({detail: "subscribed"});
    } catch (error) {
       next(error);
    }
}

export async function unsubscribeToEvent(req: Request, res: Response, next: NextFunction) {
    try {
        if(!req.user) throw new HttpError("Not Authorized", 403);

        const eventId = getValidatedId(req);

        const event = await Event.findOneAndUpdate(
            { _id: eventId },
            {
                $pull: {
                    applicants: req.user._id
                },
            },
            {
                new: true,
            }
        );

        if(!event) throw new HttpError("event not found", 404);

        await User.findOneAndUpdate(
            { _id: req.user._id },
            {
                $pull: {
                    subscriptions: event._id,
                },
            }
        );

        res.status(200).json({detail: "unsubscribed"});
    } catch (error) {
       next();
    }
}


type EventDetailInformation = {
    name: string,
    banner: string,
    creator: UserInformationInEvent,
    administrators: UserInformationInEvent[],
    category: string,
    tags: string[],
    date: Date,
    place: string,
    description: string,
    limit: number,
    isFree: boolean,
    isPublished?: boolean,
    price?: number
}

export async function eventDetail(req: Request, res: Response, next: NextFunction) {
    try {
        const eventId = req.params.eventId;

        // user and id validations
        if(!req.user) throw new HttpError("Not Authenticated", 403);
        isValidObjId([{id: eventId, model: "event"}]);

        // event validation and data
        const event = await Event.findOne({_id: eventId})
            .populate("creator")
            .populate("administrators");

        if(!event) throw new HttpError("event not found", 404);

        const isCreatorOrAdmin = await isUserEventOwnerOrAdmin({userId: req.user._id, eventId});

        // if event is not published only the creator and
        // added administrators can access the information
        if(!event.isPublished && !isCreatorOrAdmin) throw new HttpError("you don't have access to event information", 400);

        const eventInformation: EventDetailInformation = {
            name: event.name,
            banner: event.banner,
            creator: getPopulatedCreatorInEvent(event.creator),
            administrators: getPopulatedAdminsInEvent(event.administrators) ,
            category: event.category,
            tags: event.tags,
            date: event.date,
            place: event.place,
            description: event.description,
            limit: event.limit,
            isFree: event.isFree,
            price: event.price
        };

        if(isCreatorOrAdmin) {
            eventInformation["isPublished"] = event.isPublished;
        }

        res.status(200).json(eventInformation);
    } catch (error) {
        next(error);
    }
}
