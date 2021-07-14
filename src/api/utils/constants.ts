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
    : 15; // seconds | minutes | hours | days

export const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES
    ? parseInt(process.env.REFRESH_TOKEN_EXPIRES)
    : 30; // seconds | minutes | hours | days

export const JWT_SECRET = process.env.JWT_SECRET || "superSecureSecret123";

export const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017";

export const DBNAME = process.env.DBNAME || "mydb";

export const TEST_DBNAME = process.env.TEST_DBNAME || "mytestdb";