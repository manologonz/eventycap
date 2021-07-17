import { body, ValidationChain, CustomValidator} from "express-validator";
import {Types} from "mongoose";
import { HttpError } from "../../utils/types";
import User from "../models/user";
import {
    stringMessage,
    emptyStringMessage,
    requiredMessage,
    dateMessage,
    intMessage,
    booleanMessage,
    floatMessage,
    arrayMessage,
    notCeroMessage,
} from "./error.messages";

const notEmptyArray: CustomValidator = (input) => {
    if(input.length === 0) return false;
    return true;
}

const isIdValid: CustomValidator = (input) => {
    if(Types.ObjectId.isValid(input)) return true
    return false;
}

const isValidUser: CustomValidator = async (input) => {
    const user = await User.findOne({_id: input}).lean();
    if(!user) throw new HttpError("user not found", 400);
}


export function eventCreateValidators():ValidationChain[]  {
    // banner validator not added, validation is made elsewhere.
    const name = body("name")
        .exists()
        .withMessage(requiredMessage("name"))
        .bail()
        .isString()
        .withMessage(stringMessage("name"))
        .bail()
        .notEmpty()
        .withMessage(emptyStringMessage("name"));

    const category = body("category")
        .exists()
        .withMessage(requiredMessage("category"))
        .bail()
        .isString()
        .withMessage("category")
        .bail()
        .notEmpty()
        .withMessage("category");

    const tags = body("tags")
        .exists()
        .withMessage(requiredMessage("tags"))
        .bail()
        .isArray()
        .withMessage(arrayMessage("tags"));

    const tagsChild = body("tags.*")
        .optional()
        .isString()
        .withMessage(stringMessage("value"))
        .bail()
        .notEmpty()
        .withMessage(emptyStringMessage("value"));

    const date = body("date")
        .exists()
        .withMessage(requiredMessage("date"))
        .bail()
        .isDate()
        .withMessage(dateMessage("date"));

    const place = body("place")
        .exists()
        .withMessage(requiredMessage("place"))
        .bail()
        .isString()
        .withMessage(stringMessage("place"))
        .bail()
        .notEmpty()
        .withMessage(emptyStringMessage("place"));

    const description = body("description")
        .exists()
        .withMessage(requiredMessage("description"))
        .bail()
        .isString()
        .withMessage(stringMessage("description"))
        .bail()
        .notEmpty()
        .withMessage(emptyStringMessage("description"));

    const limit = body("limit")
        .exists()
        .withMessage(requiredMessage("limit"))
        .bail()
        .isInt()
        .withMessage(intMessage("limit"));

    const isFree = body("isFree")
        .exists()
        .withMessage(requiredMessage("isFree"))
        .bail()
        .isBoolean()
        .withMessage(booleanMessage("isFree"));

    const price = body("price")
        .optional()
        .isFloat()
        .withMessage(floatMessage("price"));

    return [
        name,
        category,
        tags,
        tagsChild,
        date,
        place,
        description,
        limit,
        isFree,
        price,
    ];
}

export function adminsValidators(): ValidationChain[] {
    const administrators = body("administrators")
        .exists()
        .withMessage(requiredMessage("administrator"))
        .bail()
        .isArray()
        .withMessage(arrayMessage("administrator"))
        .bail()
        .custom(notEmptyArray)
        .withMessage("[administrators] can't be an empty array");

    const arrayChild = body("administrators.*")
        .isString()
        .withMessage(stringMessage("value"))
        .bail()
        .custom(isIdValid)
        .withMessage("invalid id")
        .bail()
        .custom(isValidUser)
        .withMessage("user not found");

    return [administrators, arrayChild];
}