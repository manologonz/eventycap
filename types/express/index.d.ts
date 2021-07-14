import {IAuthTokenPayload} from "../../src/api/models/user";

declare global {
    namespace Express {
        interface Request {
            user: IAuthTokenPayload | null;
        }
    }
}

