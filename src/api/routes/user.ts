import {Router} from "express";
import { userDetail,
    userUpdateInfo,
    changeEmail,
    resetPassword,
    changeUsername,
    requestChangePassword,
    validateResetPasswordToken,
    changePassword
} from "../controllers/user";
import {
    changePasswordVal,
    changeUsernameVal,
    requestChangePasswordVal,
    resetPasswordVal,
} from "../validators/user";
import { updateInfoValidators } from "../validators/user";
import { isAuthenticated, isAccountOwner } from "../permissions";
const userUpdatePerms = [isAuthenticated, isAccountOwner];

const router = Router();

router.get("/:userId", userDetail);
router.post(
    "/reset-password-request",
    requestChangePasswordVal(),
    requestChangePassword
);
router.post(
    "/reset-password",
    resetPasswordVal(),
    resetPassword
);
router.post(
    "/reset-password/validate-token",
    validateResetPasswordToken
);
router.post("/:userId/password", changePasswordVal(), changePassword);
router.post("/:userId/email", userUpdatePerms, changeEmail);
router.post("/:userId/username", userUpdatePerms, changeUsernameVal(), changeUsername);
router.put("/:userId", userUpdatePerms, updateInfoValidators(), userUpdateInfo);

export default router;