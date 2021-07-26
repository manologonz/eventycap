import {Request, Response, NextFunction as Next} from "express";

export async function userDetail(req: Request, res: Response, next: Next) {
    try {
        res.json({detail: "not supported yet"});
    } catch (error) {
        next(error);
    }
}

export async function userUpdateInfo(req: Request, res: Response, next: Next) {
    try {
        res.json({detail: "not supported yet"});
    } catch (error) {
        next(error);
    }
}


export async function changeEmail(req: Request, res: Response, next: Next) {
    try {
        res.json({detail: "not supported yet"});
    } catch (error) {
        next(error);
    }
}

export async function changeUsername(req: Request, res: Response, next: Next) {
    try {
        res.json({detail: "not supported yet"});
    } catch (error) {
        next(error);
    }
}

export async function changePassword(req: Request, res: Response, next: Next) {
    try {
        res.json({detail: "not supported yet"});
    } catch (error) {
        next(error);
    }
}