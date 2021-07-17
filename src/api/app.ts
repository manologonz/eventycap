import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import paginate from "express-paginate";
import {notFound, errorHandler} from "../utils/middlewares";
import {IMAGE_URL, IMAGE_FOLDER} from "../utils/constants";
import All from "./routes";
import dotenv from "dotenv";
import cookieParser from  "cookie-parser";

// get configurations
dotenv.config();

// application instance creation
const app = express();

// middlewares
if(process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
}
app.use(helmet());
app.use(cors());
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(paginate.middleware(10, 20));

// routes
app.use(`/${IMAGE_URL}`, express.static(IMAGE_FOLDER));
app.use("/api", All);

// error handling
app.use(notFound);
app.use(errorHandler);

export default app;
