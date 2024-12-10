import express from "express";

const router = express.Router();

import {
  register,
  login,
  logout,
  refreshToken,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

router.post("/signup", register);

router.post("/logout", logout);

router.post("/login", login);

router.post("/refresh-token", refreshToken);

router.get("/profile", protectRouteectRoute, getProfile);

export default router;
