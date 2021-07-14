import {Request, Response, NextFunction} from "express";
import Event, {IEvent, EventDocument} from "../models/event";
import {validationResult} from "express-validator";
import {checkValidationErrors} from "../../utils/helpers";

// TODO: Add create event functionality
export function createEvent(req: Request, res: Response, next: NextFunction) {
    try {
        console.log(req.body)
        checkValidationErrors(validationResult(req));
        res.json({detai: "Not supported yet"});
    } catch(err) {
        next(err);
    }
}

// TODO: Add event filtering and listing functionality
export function listEvents(req: Request, res: Response, next: NextFunction) {
    try {
        res.json({detail: "Not supported yet"});
    } catch(err) {
        next(err);
    }
}

// TODO: Add Admin aggreation to event functionality
export function addAdminToEvent(req: Request, res: Response, next: NextFunction) {
    try {
        res.json({detail: "Not supported yet"});
    } catch (error) {
       next(error);
    }
}

// TODO: Add user subscription to event functionality
export function subscribeToEvent(req: Request, res: Response, next: NextFunction) {
    try {
        res.json({detail: "Not supported yet"});
    } catch (error) {
       next(error);
    }
}

// TODO: Add user unsubscription to event functionality
export function unsubscribeToEvent(req: Request, res: Response, next: NextFunction) {
    try {
       res.json({detail: "Not supported yet"});
    } catch (error) {
       next();
    }
}