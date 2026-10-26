/**
 * MedulloSight — Express API Gateway Server
 * Orchestrates requests between React client and the Python scientific service with SQLite persistence.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import apiRoutes from "./routes/api.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: (
      process.env.MEDULLOSIGHT_ALLOWED_ORIGINS ||
      `http://127.0.0.1:${PORT},http://localhost:${PORT},http://127.0.0.1:5173,http://localhost:5173`
    ).split(","),
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Mount API routes
app.use("/api", apiRoutes);

// Serve the built application for a single-origin production/local preview.
const clientDist = path.resolve(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) =>
    req.path.startsWith("/api/")
      ? next()
      : res.sendFile(path.join(clientDist, "index.html")),
  );
}

app.use("/api", (req, res) =>
  res.status(404).json({ error: "API endpoint not found" }),
);

// Global Error Handler (Sanitizes errors, prevents raw leak)
app.use((err, req, res, next) => {
  console.error("[Gateway Exception]", err.message);
  res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : err.status || 400).json({
    error: "Internal Gateway Error",
    message:
      err.message || "An unexpected error occurred during request processing.",
  });
});

// Initialize database and start listening
async function startServer() {
  console.log(
    "[Database] Cases and batch results persist in the Python service SQLite database.",
  );
  app.listen(PORT, process.env.HOST || "127.0.0.1", () => {
    console.log(
      `[Express Gateway] MedulloSight server active on http://127.0.0.1:${PORT}`,
    );
  });
}

startServer();
