import {Router} from "express";
import {register, refreshToken, getMe, logout, login} from "../controllers/auth";
import { isAuthenticated } from "../permissions";
import { registerValidators } from "../validators/auth";
import { loginValidators } from "../validators/auth";

const router = Router();

router.post("/login", loginValidators, login);
router.post("/logout", isAuthenticated, logout);
router.post("/register", registerValidators(), register);
router.post("/refresh_token", refreshToken);
router.get("/me", isAuthenticated, getMe);

export default router;
