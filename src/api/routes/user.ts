import {Router} from "express";
import { userDetail,
    userUpdateInfo,
    changeEmail,
    changePassword,
    changeUsername
} from "../controllers/user";
import { isAuthenticated } from "../permissions";

const router = Router();

router.get("/:userId/detail", userDetail);
router.post("/:userId/password", changePassword);
router.post("/:userId/email", changeEmail);
router.post("/:userId/username", changeUsername);
router.put("/:userId/update", userUpdateInfo);

export default router;