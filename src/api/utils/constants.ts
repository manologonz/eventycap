import { ConnectionOptions } from "mongoose"
import * as dotenv from "dotenv";
dotenv.config();

export const CONNECTION_OPTIONS: ConnectionOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
};

export enum LoginMethod {
    USERNAME = "USERNAME",
    EMAIL = "EMAIL"
}

export const JWT_TOKEN_EXPIRES = process.env.TOKEN_EXPIRES
    ? parseInt(process.env.TOKEN_EXPIRES)
    : 15; // mins
export const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES
    ? parseInt(process.env.REFRESH_TOKEN_EXPIRES)
    : (60 * 24 * 30); // 30 days
export const JWT_SECRET = process.env.JWT_SECRET || "superSecureSecret123";

export const MONGODB_URL = process.env.MONGODB_URL || "";

export const DBNAME = process.env.DBNAME || "mydb";

export const TEST_DBNAME = process.env.TEST_DBNAME || "mytestdb";