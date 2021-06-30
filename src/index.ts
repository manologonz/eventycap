import app from "./api/app";
import {CONNECTION_OPTIONS} from "./api/utils/constants";
import {connect} from "mongoose";

const port = process.env.PORT || 5000;
const url = process.env.MONGODB_URL || "";

connect(url, CONNECTION_OPTIONS).then(() => {
    app.listen(port, () => {
        console.log("CONNECTED TO DATABASE \nLISTENING: http://localhost:" + port);
    });
})
.catch((err) => console.log("MONGODB ERROR: ", err));

