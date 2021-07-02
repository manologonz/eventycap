import {ITokenPayload} from "../../src/api/models/user";

declare global {
    namespace Express {
        interface Request {
            user: ITokenPayload | null;
        }
    }
}

