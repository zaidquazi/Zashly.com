import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createMoment, getMoments, markViewed, deleteMoment, getReplies, createReply } from "../controllers/moment.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getMoments);
router.post("/", createMoment);
router.post("/:id/view", markViewed);
router.delete("/:id", deleteMoment);
router.get("/:id/replies", getReplies);
router.post("/:id/replies", createReply);

export default router;
