import db from "./db";
import app from "./api/app";

const port = process.env.PORT || 5000;

db.connect().then(() => {
    app.listen(port, () => {
        console.log("Listening on http://localhost:" + port);
    });
})
.catch((err) => console.log("DB ERROR: ", err));

