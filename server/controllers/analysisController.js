import axios from "axios";

export const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";
export function fail(res, error) {
  const status =
    error.response?.status || (error.code === "ECONNREFUSED" ? 503 : 500);
  return res
    .status(status)
    .json({
      error:
        status === 503
          ? "Scientific engine is offline. Start all services with npm run dev."
          : "Request failed",
      detail: error.response?.data?.detail || error.message,
    });
}
export async function processSingleImage(req, res) {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });
  try {
    const form = new FormData();
    form.append(
      "file",
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname,
    );
    const fields = [
      "sequence",
      "contrast_low_p",
      "contrast_high_p",
      "gamma",
      "butterworth_d0",
      "butterworth_order",
      "median_kernel",
      "morph_radius_small",
      "morph_radius_large",
      "pipeline_mode",
      "persist",
      "include_ml",
    ];
    for (const key of fields)
      if (req.body[key] !== undefined) form.append(key, String(req.body[key]));
    const result = await axios.post(`${PYTHON_SERVICE_URL}/process`, form, {
      timeout: 120000,
      maxBodyLength: 40 * 1024 * 1024,
      maxContentLength: 80 * 1024 * 1024,
    });
    res.json(result.data);
  } catch (error) {
    fail(res, error);
  }
}
export function proxy(path, method = "get", binary = false) {
  return async (req, res) => {
    try {
      const endpoint = typeof path === "function" ? path(req) : path;
      const result = await axios({
        url: `${PYTHON_SERVICE_URL}${endpoint}`,
        method,
        params: method === "get" ? req.query : undefined,
        data: method !== "get" ? req.body : undefined,
        responseType: binary ? "arraybuffer" : "json",
        timeout: 120000,
        maxContentLength: 80 * 1024 * 1024,
      });
      if (binary)
        res.type(result.headers["content-type"] || "application/octet-stream");
      if (result.headers["content-disposition"])
        res.setHeader(
          "Content-Disposition",
          result.headers["content-disposition"],
        );
      res.send(result.data);
    } catch (error) {
      fail(res, error);
    }
  };
}
export const getSessions = proxy("/sessions");
export const getSessionById = proxy(
  (req) => `/sessions/${encodeURIComponent(req.params.id)}`,
);
export const getSamples = proxy("/samples");
export const generateReportPdf = proxy("/report/pdf", "post", true);
export async function benchmarkNoise(req, res) {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });
  try {
    const form = new FormData();
    form.append(
      "file",
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname,
    );
    form.append("density", String(req.body.density ?? 0.05));
    const result = await axios.post(
      `${PYTHON_SERVICE_URL}/benchmark/noise`,
      form,
      { timeout: 60000 },
    );
    res.json(result.data);
  } catch (error) {
    fail(res, error);
  }
}
