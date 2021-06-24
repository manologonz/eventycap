import { ConnectionOptions } from "mongoose"

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
