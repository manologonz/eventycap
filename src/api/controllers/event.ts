import {Request, Response, NextFunction} from "express";
import Event, {IEvent, EventDocument} from "../models/event";
import { IMAGE_URL } from "../../utils/constants";
import {validationResult} from "express-validator";
import {checkValidationErrors, isValidObjId} from "../../utils/helpers";
import { HttpError } from "../../utils/types";
import paginate from "express-paginate";
import {Types} from "mongoose";
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
            isPublished: false
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

// TODO: Add event filtering functionality
export async function listEvents(req: Request, res: Response, next: NextFunction) {
    try {
        const limit = parseInt(req.query.limit as string, 10);
        const skip = req.skip || 0;
        const currentPage = parseInt(req.query.page as string, 10);
        const count = await Event.find({}).countDocuments({});
        const result = await Event.find({}).limit(limit).skip(skip).lean().exec();
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
                    administrators: req.user._id
                },
            },
            {
                new: true,
            }
        );

        if(!event) throw new HttpError("event not found", 404);

        res.status(200).json({detail: "unsubscribed"});
    } catch (error) {
       next();
    }
}