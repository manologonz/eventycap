import {Request, Response, NextFunction} from "express";
import {LoginMethod} from "./constants";
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

export type Port = string | number;

export type Endpoint = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export class LoginObject {
    method: string | null | undefined;

    constructor() {
        this.method = process.env.LOGIN_METHOD;
    }

    isEmailLogin(): boolean {
        return this.method === LoginMethod.EMAIL;
    }

    isUsernameLogin(): boolean {
        return this.method === LoginMethod.USERNAME;
    }

    isMethodNotSet(): boolean {
        return (
            !this.method ||
            (this.method !== LoginMethod.EMAIL &&
                this.method !== LoginMethod.USERNAME)
        );
    }
}