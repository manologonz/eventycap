import {Router} from "express";
import RAuth from "./auth";
import RUser from "./user";

const router = Router();

router.use("/auth", RAuth);
router.use("/user", RUser);

export default router;
