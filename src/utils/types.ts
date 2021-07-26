import {Request, Response, NextFunction} from "express";
import * as dotenv from "dotenv";
dotenv.config();
export class HttpError extends Error {
    statusCode: number;
    message: string;
    isValidationError: boolean;
    validationErrors: ValidationErrors;

    constructor(
        message: string,
        statusCode: number,
        isValidationError: boolean = false,
        validationErrors: ValidationErrors = {}
    ) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.isValidationError = isValidationError;
        this.validationErrors = validationErrors;
    }
}

export type ValidationErrors = {
    [field: string]: string[];
};

export type ErrorResponse = {
    detail: string | object | ValidationErrors;
    stack?: string ;
};

export type AuthTokens = {
    new_access_token: string,
    new_refresh_token: string,
    refresh_token_expiry: Date,
    access_token_expiry: Date
};