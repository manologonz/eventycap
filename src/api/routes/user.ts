import {Router} from "express";
import { isAuthenticated } from "../permissions";

const router = Router();

router.get("/", isAuthenticated, (req, res, next) => {
    res.json("something");
});

export default router;