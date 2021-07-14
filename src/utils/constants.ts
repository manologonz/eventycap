import {Request, Response, NextFunction as Next} from "express";
import { ConnectionOptions } from "mongoose"
import path from "path";
import {v4 as uuid} from "uuid";
import multer from "multer";
import * as dotenv from "dotenv";
dotenv.config();

export const CONNECTION_OPTIONS: ConnectionOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
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


type multerCB = (error: Error | null, destination: string) => void;

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: multerCB) {
        cb(null, path.join(__dirname, "..", "..", "dev-images") );
    },
    filename: function (req: Request, file: Express.Multer.File, cb: multerCB) {
        cb(null, uuid() + new Date().getTime());
    }
});

export const upload = multer({storage});