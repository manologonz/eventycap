import User from "../models/user";
import { matchingPasswords } from "../../utils/helpers";
import {checkSchema, ValidationChain, CustomValidator} from "express-validator";
import {requiredMessage,stringMessage, emptyStringMessage, dateMessage, intMessage} from "./error.messages";
import { PASSWORD_LENGTH } from "../../utils/constants";

const uniqueUsername: CustomValidator = async (input) => {
    const user = await User.findOne({username: input}).lean();
    if(user) return Promise.reject();
    return true;
}

const uniqueEmail: CustomValidator = async (input) => {
    const user = await User.findOne({email: input}).lean();
    if(user) return Promise.reject();
    return true;
}

export function loginValidators(): ValidationChain[]{
    return checkSchema({
        email: {
            exists: {errorMessage: requiredMessage("email"), bail: true},
            notEmpty: {errorMessage: emptyStringMessage("email"), bail: true},
            isEmail: {errorMessage: "enter a valid message"}
        },
        password: {
            exists: {errorMessage: requiredMessage("password"), bail: true},
            isString: {errorMessage: stringMessage("password"), bail: true},
            notEmpty: {errorMessage: emptyStringMessage("password")}
        }
    });
}

export function registerValidators(): ValidationChain[] {
    return checkSchema({
        username: {
            exists: {errorMessage: requiredMessage("username"), bail: true},
            isString: {errorMessage: stringMessage("username"), bail: true},
            isLength: {
                errorMessage: "[username] must have in between 5 and 15 characters",
                options: {min: 5, max: 15}
            },
            custom: {errorMessage: "username already in use", options: uniqueUsername}
        },
        firstName: {
            exists: {errorMessage: requiredMessage("username"), bail: true},
            isString: {errorMessage: stringMessage("username"), bail: true},
            isLength: {
                errorMessage: "[firstName] must have in between 5 and 20 characters of length",
                options: {min: 3, max: 20}
            }
        },
        lastName:{
            exists: {errorMessage: requiredMessage("username"), bail: true},
            isString: {errorMessage: stringMessage("username"), bail: true},
            isLength: {
                errorMessage: "[fristName] must have in between 5 and 20 characters of length",
                options: {min: 3, max: 20}
            }
        },
        birthDate: {
            exists: {errorMessage: requiredMessage("birthDate"), bail: true},
            isDate: {errorMessage: dateMessage("birthDate")},
        },
        role: {
            exists: {errorMessage: requiredMessage("role"), bail: true},
            isInt: {errorMessage: intMessage("role"), bail: true},
            isIn: {errorMessage: "[role] must be 0 or 1", options: [[1, 0]]}
        },
        email: {
            exists: {errorMessage: requiredMessage("email"), bail: true},
            isEmail: {errorMessage: "enter a valid email"},
            custom: {errorMessage: "email already in use", options: uniqueEmail}
        },
        password: {
            exists: {errorMessage: requiredMessage("password"), bail: true},
            isString: {errorMessage: stringMessage("password"), bail: true},
            isLength: {
                errorMessage: `password must be at least ${PASSWORD_LENGTH} characters long`,
                options: {min: PASSWORD_LENGTH}
            }
        },
        confirmPassword: {
            exists: {errorMessage: requiredMessage("confirmPassword"), bail: true},
            isString: {errorMessage: stringMessage("confirmPassword"), bail: true},
            custom: {errorMessage: "passwords don't match", options: matchingPasswords}
        }
    });
}