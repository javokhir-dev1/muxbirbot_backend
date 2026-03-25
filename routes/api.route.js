import { Router } from "express";
const router = Router();

import { createMuxbir, getAllMuxbirlar, deleteMuxbir } from "../controllers/muxbir.controller.js";
import { addLavha, getBestReporter, getMonthlyStats, getTodayReports, getTopMuxbirlar } from "../controllers/lavha.controller.js";

// Muxbir routelari
router.get("/muxbirlar", getAllMuxbirlar);
router.post("/muxbirlar", createMuxbir);
router.delete("/muxbirlar/:id", deleteMuxbir);

// Lavha va Stats routelari
router.post("/lavhalar", addLavha);
router.get("/stats/top", getTopMuxbirlar);
router.get("/stats/today", getTodayReports);
router.get("/stats/monthly", getMonthlyStats);
router.get("/stats/best", getBestReporter);

export default router;