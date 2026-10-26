/**
 * MedulloSight — Batch Processing Controller
 * Handles multi-file uploads, sequential processing, CSV metrics generation, and ZIP bundling.
 */

import axios from "axios";
import crypto from "crypto";
import path from "path";
import archiver from "archiver";

const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";

export async function processBatch(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: "No files provided for batch processing." });
    }

    const batchId = crypto.randomUUID();
    const results = [];
    const sequence = req.body.sequence || "Unknown";

    for (const file of req.files) {
      try {
        const formData = new FormData();
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append("file", blob, file.originalname);
        formData.append("sequence", sequence);

        const pyResponse = await axios.post(
          `${PYTHON_SERVICE_URL}/process`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 120000,
          },
        );

        results.push({
          success: true,
          filename: file.originalname,
          ...pyResponse.data,
        });
      } catch (sliceErr) {
        results.push({
          success: false,
          filename: file.originalname,
          error: sliceErr.response?.data?.detail || sliceErr.message,
        });
      }
    }

    const batchSummary = {
      batchId,
      total_files: req.files.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
      createdAt: new Date(),
    };

    // Cache batch in memory store
    await axios.post(`${PYTHON_SERVICE_URL}/batches`, batchSummary, {
      maxBodyLength: Infinity,
      timeout: 30000,
    });

    return res.json(batchSummary);
  } catch (err) {
    console.error("[Batch Error]", err.message);
    return res
      .status(500)
      .json({ error: "Batch processing failed", detail: err.message });
  }
}

export async function exportBatchCsv(req, res) {
  try {
    const { batchId } = req.params;
    const { data: batch } = await axios.get(
      `${PYTHON_SERVICE_URL}/batches/${encodeURIComponent(batchId)}`,
    );

    if (!batch) {
      return res.status(404).json({ error: "Batch job not found or expired." });
    }

    // Build CSV header
    const headers = [
      "Filename",
      "Sequence",
      "Width",
      "Height",
      "ProcessingTimeMs",
      "InitialStd",
      "StretchedStd",
      "ShannonEntropy",
      "OtsuThreshold",
      "ForegroundPercent",
      "CCCountBeforeOpen",
      "CCCountAfterOpen",
      "CCReductionPercent",
      "RoiAreaPixels",
      "RoiAreaPercent",
      "RoiBBox_ymin",
      "RoiBBox_xmin",
      "RoiBBox_ymax",
      "RoiBBox_xmax",
      "WarningsCount",
      "WarningCodes",
      "ModelVersion",
      "DefaultModel",
      "DefaultClassScore",
      "RawSvmScore",
      "SipSvmScore",
      "RawMobileNetScore",
      "SipMobileNetScore",
    ];

    const rows = [headers.join(",")];

    for (const item of batch.results) {
      if (item.success) {
        const m = item.metrics || {};
        const d = item.dimensions || {};
        const bbox = m.roi_bbox || [0, 0, 0, 0];
        const warnCodes = (item.warnings || []).map((w) => w.code).join(";");

        const predictions = Object.fromEntries(
          (item.ml?.predictions || []).map((p) => [p.id, p.score]),
        );
        const row = [
          `"${item.filename.replaceAll('"', '""')}"`,
          item.sequence,
          d.width || 0,
          d.height || 0,
          item.total_duration_ms || 0,
          m.initial_std || 0,
          m.stretched_std || 0,
          m.entropy || 0,
          m.otsu_threshold || 0,
          m.foreground_percent || 0,
          m.cc_count_before_open || 0,
          m.cc_count_after_open || 0,
          m.cc_reduction_percent || 0,
          m.roi_area_pixels || 0,
          m.roi_area_percent || 0,
          bbox[0],
          bbox[1],
          bbox[2],
          bbox[3],
          (item.warnings || []).length,
          `"${warnCodes}"`,
          item.ml?.model_version || "",
          item.ml?.default_model || "",
          predictions[item.ml?.default_model] ?? "",
          predictions.svm_raw ?? "",
          predictions.svm_sip ?? "",
          predictions.mobilenet_raw ?? "",
          predictions.mobilenet_sip ?? "",
        ];
        rows.push(
          row
            .map((value, index) => {
              if (index !== 0 || typeof value !== "string") return value;
              const raw = item.filename;
              const safe = /^[=+@\t\r-]/.test(raw) ? `'${raw}` : raw;
              return `\"${safe.replaceAll('\"', '\"\"')}\"`;
            })
            .join(","),
        );
      }
    }

    const csvContent = rows.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=MedulloSight_Batch_${batchId.substring(0, 8)}.csv`,
    );
    return res.send(csvContent);
  } catch (err) {
    return res
      .status(err.response?.status || 500)
      .json({ error: "Failed to export CSV", detail: err.message });
  }
}

export async function exportBatchZip(req, res) {
  try {
    const { batchId } = req.params;
    const { data: batch } = await axios.get(
      `${PYTHON_SERVICE_URL}/batches/${encodeURIComponent(batchId)}`,
    );

    if (!batch) {
      return res.status(404).json({ error: "Batch job not found or expired." });
    }

    const archive = archiver("zip", { zlib: { level: 9 } });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=MedulloSight_Images_${batchId.substring(0, 8)}.zip`,
    );

    archive.on("error", () => {
      if (!res.headersSent) res.status(500).end();
      else res.destroy();
    });
    archive.pipe(res);

    for (const [index, item] of batch.results.entries()) {
      if (item.success && item.step_images) {
        const baseName = `${index + 1}_${path
          .basename(item.filename)
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
        for (const [stageName, b64Data] of Object.entries(item.step_images)) {
          if (b64Data && b64Data.includes(",")) {
            const buffer = Buffer.from(b64Data.split(",")[1], "base64");
            archive.append(buffer, { name: `${baseName}/${stageName}.png` });
          }
        }
      }
    }

    await archive.finalize();
  } catch (err) {
    return res
      .status(err.response?.status || 500)
      .json({ error: "Failed to package ZIP archive", detail: err.message });
  }
}
