/**
 * MedulloSight — Express API Router
 * Defines all endpoints under /api for single analysis, batch runs, reports, and samples.
 */

import express from "express";
import { upload } from "../middleware/upload.js";
import {
  processSingleImage,
  getSessions,
  getSessionById,
  generateReportPdf,
  benchmarkNoise,
  getSamples,
  proxy,
} from "../controllers/analysisController.js";
import {
  processBatch,
  exportBatchCsv,
  exportBatchZip,
} from "../controllers/batchController.js";

const router = express.Router();

// Health Check
router.get("/health", proxy("/health"));

// Single Image Analysis
router.post("/analyze/single", upload.single("file"), processSingleImage);

// Sessions History
router.get("/sessions", getSessions);
router.get("/sessions/:id", getSessionById);

// Reports & Noise Benchmarking
router.post("/report/pdf", generateReportPdf);
router.post("/benchmark/noise", upload.single("file"), benchmarkNoise);

// Built-in Benchmark Slices
router.get("/samples", getSamples);

// Batch Analysis & Exports
router.post("/analyze/batch", upload.array("files", 20), processBatch);
router.get("/export/csv/:batchId", exportBatchCsv);
router.get("/export/zip/:batchId", exportBatchZip);

router.get("/cohort", proxy("/cohort"));
router.get("/cohort/summary", proxy("/cohort/summary"));
router.get(
  "/cohort/:id/image",
  proxy(
    (req) => `/cohort/${encodeURIComponent(req.params.id)}/image`,
    "get",
    true,
  ),
);
router.get("/models", proxy("/models"));
router.get("/batches", proxy("/batches"));
router.get(
  "/batches/:id",
  proxy((req) => `/batches/${encodeURIComponent(req.params.id)}`),
);
router.post("/analyze/cohort", proxy("/analyze/cohort", "post"));
router.put(
  "/sessions/:id/notes",
  proxy((req) => `/sessions/${encodeURIComponent(req.params.id)}/notes`, "put"),
);
export default router;
