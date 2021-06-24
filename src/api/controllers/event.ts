import {Request, Response, NextFunction} from "express";
import Event, {IEvent, EventDocument} from "../models/event";
import {validationResult} from "express-validator";
import {checkValidationErrors} from "../utils/helpers";

export function createEvent(req: Request, res: Response, next: NextFunction) {
    try {
        checkValidationErrors(validationResult(req));
        res.json({detai: "Not supported yet"});
    } catch(err) {
        next(err);
    }
}

export function listEvents(req: Request, res: Response, next: NextFunction) {
    try {
        res.json({detail: "Not supported yet"});
    } catch(err) {
        next(err);
    }
}
