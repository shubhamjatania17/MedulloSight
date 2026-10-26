export const BASE = import.meta.env.VITE_API_BASE_URL || "/api";
export async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new Error("The local engine request timed out.")),
    path === "/analyze/batch" ? 900000 : 120000,
  );
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;
  let response;
  try {
    response = await fetch(`${BASE}${path}`, { ...options, signal });
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message =
        typeof body.detail === "string"
          ? body.detail
          : body.error || JSON.stringify(body.detail);
    } catch {
      /* Keep the HTTP status. */
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.json();
}
export const jsonPost = (path, data, method = "POST") =>
  request(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const pct = (value) =>
  Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "—";
export const num = (value) =>
  Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "—";

export async function getEvaluation() {
  try {
    return await request("/models");
  } catch {
    const response = await fetch("/research/evaluation.json");
    if (!response.ok)
      throw new Error("No trained evaluation artifact is available.");
    return { ...(await response.json()), snapshot: true };
  }
}
