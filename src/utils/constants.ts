import {Request, Response, NextFunction as Next} from "express";
import { ConnectionOptions } from "mongoose"
import { HttpError } from "./types";
import path from "path";
import {v4 as uuid} from "uuid";
import multer from "multer";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

export const CONNECTION_OPTIONS: ConnectionOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
};

export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY
    ? parseInt(process.env.ACCESS_TOKEN_EXPIRY)
    : 15; // minutes

export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY
    ? parseInt(process.env.REFRESH_TOKEN_EXPIRY)
    : 30; // days

export const JWT_SECRET = process.env.JWT_SECRET || "superSecureSecret123";

export const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/";

export const DBNAME = process.env.DBNAME || "mydb";

export const TEST_DBNAME = process.env.TEST_DBNAME || "mytestdb";

export const IMAGE_FOLDER = process.env.NODE_ENV === "production" ? "images" : "dev-images";

export const IMAGE_URL = "images";

export const PASSWORD_LENGTH = 8;

export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";

export const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || "";

function createMediaFolders(): string[] {
    const mainFolder = path.join(__dirname, "..", "..", IMAGE_FOLDER);
    const defaultFolder = path.join(mainFolder, "default");

    if (!fs.existsSync(mainFolder)) {
        fs.mkdirSync(mainFolder);
    }

    if (!fs.existsSync(defaultFolder)) {
        fs.mkdirSync(defaultFolder);
    }
    return [mainFolder, defaultFolder];
}

type multerCB = (error: Error | null, destination: string) => void;

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: multerCB) {
        const [mainFolder] = createMediaFolders();

        if(req.user) {
            const userFolder = path.join(mainFolder, `${req.user._id}`);
            if(!fs.existsSync(userFolder)){
                fs.mkdirSync(userFolder, {recursive: true});
            }
            cb(null, path.join(mainFolder, `${req.user._id}`));
        } else {
            cb(null, path.join(__dirname, "..", "..", "dev-images", "default"));
        }

    },
    filename: function (req: Request, file: Express.Multer.File, cb: multerCB) {
        cb(null, uuid() + new Date().getTime() + path.extname(file.originalname));
    }
});

const imageFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    if (!file.originalname.match(/\.(JPG|jpg|jpeg|png|gif)$/)) {
        return cb(new HttpError('Only image files are allowed!', 400), false);
    }
    cb(null, true);
};

export const upload = multer({storage, fileFilter: imageFilter});

export type ResetPasswordMailParams = {
    toEmail: string,
    userId: string,
    resetToken: string
}