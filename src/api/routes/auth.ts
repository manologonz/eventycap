import {Router} from "express";
import {register, refreshToken, logout} from "../controllers/auth";
import { isAuthenticated } from "../permissions";
import {getLoginEndpoint, getLoginValidators} from "../utils/helpers";
import { registerValidators } from "../validators/auth";

const loginEndpoint = getLoginEndpoint();
const loginValidators = getLoginValidators();

const router = Router();

router.post("/login", loginValidators, loginEndpoint);
router.post("/logout", isAuthenticated, logout);
router.post("/register", registerValidators(), register);
router.post("/refresh_token", refreshToken);
// router.get("/me", isAuthenticated, getMe);

export default router;
