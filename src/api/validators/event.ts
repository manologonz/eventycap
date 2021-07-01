import { checkSchema, ValidationChain} from "express-validator";
import { stringMessage, emptyStringMessage, requiredMessage, dateMessage, intMessage, booleanMessage, floatMessage, arrayMessage} from "./error.messages";

export function eventCerateValidators():ValidationChain[]  {
    // banner validator not added, beacous it's an image.
    return checkSchema({
        name: {
            exists: {errorMessage: requiredMessage("name"), bail: true},
            isString: {errorMessage: stringMessage("name"), bail: true},
            notEmpty: {errorMessage: emptyStringMessage("name")}
        },
        category: {
            exists: {errorMessage: requiredMessage("category"), bail: true},
            isString: {errorMessage: stringMessage("category"), bail: true},
            notEmpty: {errorMessage: emptyStringMessage("category")}
        },
        tags: {
            exists: {errorMessage: requiredMessage("tags"), bail: true},
            isArray: {errorMessage: arrayMessage("tags")},
        },
        "tags.*": {
            optional: {},
            isString: {errorMessage: stringMessage("0")},
            notEmpty: {errorMessage: emptyStringMessage("0")}
        },
        date: {
            exists: {errorMessage: requiredMessage("date"), bail: true},
            isDate: {errorMessage: dateMessage("date")}
        },
        place: {
            exists: {errorMessage: requiredMessage("place"), bail: true},
            isString: {errorMessage: stringMessage("place"), bail: true},
            notEmpty: {errorMessage: emptyStringMessage("place")}
        },
        description: {
            exists: {errorMessage: requiredMessage("description"), bail: true},
            isString: {errorMessage: stringMessage("description"), bail: true},
            notEmpty: {errorMessage: emptyStringMessage("description")}
        },
        limit: {
            exists: {errorMessage: requiredMessage("limit"), bail: true},
            isInt: {errorMessage: intMessage("limit")},
        },
        isFree: {
            exists: {errorMessage: requiredMessage("isFree"), bail: true},
            isBoolean: {errorMessage: booleanMessage("isFree")}
        },
        price: {
            optional:{},
            isFloat: {errorMessage: floatMessage("price")},
        }
    });
}