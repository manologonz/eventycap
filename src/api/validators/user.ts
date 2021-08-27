import { body, ValidationChain, CustomValidator } from "express-validator";
import User from "../models/user";
import { PASSWORD_LENGTH } from "../../utils/constants";
import { matchingPasswords } from "../../utils/helpers";
import {
    dateMessage,
    emptyStringMessage,
    intMessage,
    requiredMessage,
    stringMessage,
} from "./error.messages";
import { isString } from "lodash";

const uniqueUsername: CustomValidator = async (input, {req}) => {
    const user = await User.findOne({username: input}).lean();
    if(user && req.user._id !== user._id.toString()) return Promise.reject();
    return true;
}


const uniqueEmail: CustomValidator = async (input, {req}) => {
    const user = await User.findOne({email: input}).lean();
    if(user && req.user._id !== user._id.toString())
        return Promise.reject("email already in use");
    return true;
}

export function updateInfoValidators(): ValidationChain[] {
    const firstName = body("firstName")
        .exists()
        .withMessage(requiredMessage("firstName"))
        .isString()
        .withMessage(stringMessage("firstName"))
        .isEmpty()
        .withMessage(emptyStringMessage("firstName"));

    const lastName = body("lastName")
        .exists()
        .withMessage(requiredMessage("lastName"))
        .isString()
        .withMessage(stringMessage("lastName"))
        .isEmpty()
        .withMessage(emptyStringMessage("lastName"));

    const birthDate = body("birthDate")
        .exists()
        .withMessage(requiredMessage("birthDate"))
        .isDate()
        .withMessage(dateMessage("birthDate"));

    const role = body("role")
        .exists()
        .withMessage(requiredMessage("role"))
        .isInt()
        .withMessage(intMessage("role"))
        .isIn([1, 2])
        .withMessage("[role] must be 1 or 2");

    return [firstName, lastName, birthDate, role];
}

export function requestChangePasswordVal(): ValidationChain {
    return body("email")
        .exists()
        .withMessage(requiredMessage("email"))
        .bail()
        .isEmail()
        .withMessage("enter a valid email")
        .trim()
        .normalizeEmail();
}

export function resetPasswordVal(): ValidationChain[] {
    const newPassword = body("newPassword")
        .exists()
        .withMessage(requiredMessage("newPassword"))
        .isString()
        .withMessage(stringMessage("newPassword"))
        .isLength({min: PASSWORD_LENGTH})
        .withMessage(`password must be at least ${PASSWORD_LENGTH} characters long`);

    const confirmPassword = body("confirmPassword")
        .exists()
        .withMessage(requiredMessage("confirmPassword"))
        .customSanitizer(matchingPasswords);

    return [newPassword, confirmPassword];
}

export function changePasswordVal(): ValidationChain[] {
    const newPassword = body("newPassword")
        .exists()
        .withMessage(requiredMessage("newPassword"))
        .bail()
        .isString()
        .withMessage(stringMessage("newPassword"))
        .bail()
        .isLength({min: PASSWORD_LENGTH})
        .withMessage(`password must be at least ${PASSWORD_LENGTH} characters long`);

    const confirmPassword = body("confirmNewPassword")
        .exists()
        .withMessage(requiredMessage("confirmPassword"))
        .bail()
        .customSanitizer(matchingPasswords);

    return [newPassword, confirmPassword];
}

export function changeUsernameVal(): ValidationChain[] {
    const newUsername = body("newUsername")
        .exists()
        .withMessage(requiredMessage("newUsername"))
        .bail()
        .isLength({min:5, max: 15})
        .withMessage("[username] must have in between 5 and 15 characters")
        .custom(uniqueUsername)
        .withMessage("username already in use");

    const password = body("password")
        .exists()
        .withMessage(requiredMessage("password"))
        .bail()
        .isString()
        .withMessage(stringMessage("password"));

    return [newUsername, password]
}

export function changeEmailVal(): ValidationChain[] {

    const newEmail = body("newEmail")
        .exists()
        .withMessage(requiredMessage("newEmail"))
        .bail()
        .isEmail()
        .withMessage("enter a valid email")
        .bail()
        .custom(uniqueEmail)
        .withMessage("email address already in use")
        .trim()
        .normalizeEmail();

    const password = body("password")
        .exists()
        .withMessage(requiredMessage("password"))
        .bail()
        .isString()
        .withMessage(stringMessage("password"));

    return [newEmail, password]
}