import mongoose from "mongoose";
import { MONGODB_URL, DBNAME, TEST_DBNAME, CONNECTION_OPTIONS} from "../api/utils/constants";

function connect(): Promise<void> {
    return new Promise((resolve, reject) => {
        let url = "";
        if(process.env.NODE_ENV === "test") {
            url = `${MONGODB_URL}/${TEST_DBNAME}`;
        } else {
            url = `${MONGODB_URL}/${DBNAME}`;
        }
        mongoose.connect(url, CONNECTION_OPTIONS, (error) => {
            if(error) return reject(error);
            return resolve();
        });
    });
}

function close(): Promise<void> {
    return mongoose.disconnect();
}

const db = {
    connect,
    close
}

export default db;