import {Router} from "express";
import RAuth from "./auth";
import RUser from "./user";
import REvent from "./event";

const router = Router();

router.use("/auth", RAuth);
router.use("/user", RUser);
router.use("/event", REvent);

export default router;
