import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { analytic } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, analytic);

export default router;
