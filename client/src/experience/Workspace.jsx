import { outputsFor } from "./processing";
import Measurements from "./Measurements";
import { download } from "./download";
import { BASE, jsonPost, num, pct, request } from "./api";
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Download,
  FileImage,
  FlaskConical,
  Save,
  Upload,
} from "lucide-react";
import {
  Button,
  Compare,
  Histogram,
  LinkArrow,
  Notice,
  SectionTitle,
  StagePlayer,
  Stat,
  Tag,
  Viewer,
} from "./shared";

export function Overview({
  samples,
  summary,
  evaluation,
  sessions,
  navigate,
  selectSample,
  loadSession,
}) {
  const best = evaluation?.models?.find(
    (m) => m.id === evaluation.default_model,
  );
  return (
    <>
      <SectionTitle
        eyebrow="YOUR RESEARCH WORKSPACE"
        title="A focused lens on medulloblastoma."
        action={
          <Button onClick={() => navigate("case")}>
            Analyze a case <ArrowUpRight size={16} />
          </Button>
        }
      >
        Explore the evidence behind an image, from the original notebook to
        experimental machine learning.
      </SectionTitle>
      <div className="stat-grid">
        <Stat
          label="Medulloblastoma images"
          value={summary?.medulloblastoma || 131}
          detail="23 T1 · 67 T1C+ · 41 T2"
        />
        <Stat
          label="Audited source images"
          value={num(summary?.total || 4479)}
          detail="15 category labels · 44 folders"
        />
        <Stat
          label="Trained model variants"
          value={evaluation?.models?.length || "—"}
          detail="Raw and SIP inputs, paired evaluation"
        />
        <Stat
          label="Recent saved cases"
          value={sessions.length}
          detail="Complete results persist in SQLite"
        />
      </div>
      <div className="overview-grid">
        <div className="featured-case">
          <div>
            <span className="eyebrow">START WITH A REAL EXAMPLE</span>
            <h2>
              One scan.
              <br />
              <em>Explore every layer.</em>
            </h2>
            <p>
              Open MB04 from the original notebook. Compare enhancement, inspect
              the candidate, and run the experimental classifiers.
            </p>
            <Button
              onClick={() =>
                selectSample(
                  samples.find((s) => s.id === "MB04_T1C") || samples[0],
                )
              }
            >
              Open the case <ArrowRight size={16} />
            </Button>
            <Tag>Demonstration group · excluded from training</Tag>
          </div>
          <img src="/mri/MB04_T1C.jpg" alt="MB04 notebook MRI example" />
        </div>
        <div className="ms-card">
          <span className="eyebrow">THE CURRENT EXPERIMENT</span>
          <h3>Does SIP help classification?</h3>
          {best ? (
            <>
              <div className="metric-pair">
                <Stat label="Test recall" value={pct(best.test.recall)} />
                <Stat label="Test precision" value={pct(best.test.precision)} />
              </div>
              <p>
                The default model is selected on validation F1. These test
                results describe held-out image groups, not patient-level
                clinical performance.
              </p>
            </>
          ) : (
            <p>
              Evaluation appears when the trained artifacts are available. The
              workspace never substitutes example scores for measured results.
            </p>
          )}
          <LinkArrow onClick={() => navigate("evaluation")}>
            Explore the evidence
          </LinkArrow>
        </div>
      </div>
      <SectionTitle
        eyebrow="THE NOTEBOOK COLLECTION"
        title="Choose a starting point."
        action={
          <LinkArrow onClick={() => navigate("cohort")}>
            Full cohort explorer
          </LinkArrow>
        }
      />
      <div className="sample-gallery small">
        {samples.slice(0, 5).map((s) => (
          <button
            key={s.id}
            className="sample-tile"
            onClick={() => selectSample(s)}
          >
            <div>
              <img src={s.path} alt={s.id} />
              <ArrowUpRight size={15} />
            </div>
            <span>{s.id.replace("_", " · ")}</span>
            <small>
              {s.sequence} · {s.dimensions.width} × {s.dimensions.height}
            </small>
          </button>
        ))}
      </div>
      <SectionTitle
        eyebrow="RESEARCH HISTORY"
        title="Pick up where you left off."
      />
      {sessions.length ? (
        <div className="ms-card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Case</th>
                <th>Sequence</th>
                <th>Candidate area</th>
                <th>Saved</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 8).map((s) => (
                <tr key={s.sessionId}>
                  <td>{s.filename}</td>
                  <td>
                    <Tag>{s.sequence}</Tag>
                  </td>
                  <td>{num(s.metrics?.roi_area_percent)}%</td>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="text-link"
                      onClick={() => loadSession(s.sessionId)}
                    >
                      Open <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="ms-card history-intro">
          <BookOpen size={28} />
          <div>
            <h3>Your research history starts with a case.</h3>
            <p>
              Notebook examples are ready to explore. Analyze and save one to
              keep its images, ML scores, measurements and notes together.
            </p>
          </div>
          <Button secondary onClick={() => navigate("case")}>
            Open case workspace
          </Button>
        </div>
      )}
    </>
  );
}

export function Cohort({ selectCohort, samples, selectSample }) {
  const [disease, setDisease] = useState("Medulloblastoma"),
    [sequence, setSequence] = useState("All"),
    [split, setSplit] = useState("All"),
    [page, setPage] = useState(1),
    [q, setQ] = useState("");
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const abort = new AbortController();
    const query = new URLSearchParams({
      disease,
      sequence,
      split,
      page,
      limit: 18,
      q,
    });
    request(`/cohort?${query}`, { signal: abort.signal })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [disease, sequence, split, page, q]);
  return (
    <>
      <SectionTitle
        eyebrow="COHORT EXPLORER"
        title="The images behind the investigation."
      >
        Medulloblastoma is the focus. Other categories provide comparison data.
        The displayed diagnosis is the supplied dataset label, not a new
        prediction.
      </SectionTitle>
      <div className="cohort-banner">
        <strong>131</strong>
        <div>
          <h3>Medulloblastoma-labelled images</h3>
          <p>
            23 T1 · 67 T1C+ · 41 T2. Original notebook groups are reserved for
            demonstration.
          </p>
        </div>
        <Tag tone="amber">No verified patient identifiers</Tag>
      </div>
      <div className="filter-row">
        <label>
          Dataset label
          <select
            value={disease}
            onChange={(e) => {
              setLoading(true);
              setError("");
              setDisease(e.target.value);
              setPage(1);
            }}
          >
            {(
              data?.diseases || [
                "Medulloblastoma",
                "Ependymoma",
                "Astrocytoma",
                "Normal",
              ]
            )
              .concat("All")
              .map((x) => (
                <option key={x}>{x}</option>
              ))}
          </select>
        </label>
        <label>
          Sequence
          <select
            value={sequence}
            onChange={(e) => {
              setLoading(true);
              setError("");
              setSequence(e.target.value);
              setPage(1);
            }}
          >
            {["All", "T1", "T1C+", "T2"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Experimental split
          <select
            value={split}
            onChange={(e) => {
              setLoading(true);
              setError("");
              setSplit(e.target.value);
              setPage(1);
            }}
          >
            {[
              "All",
              "train",
              "validation",
              "test",
              "demonstration",
              "review",
              "duplicate",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="search-field">
          Search source filename
          <input
            value={q}
            onChange={(e) => {
              setLoading(true);
              setError("");
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search the cohort…"
          />
        </label>
      </div>
      {error ? (
        <>
          <Notice error>
            {error} The full cohort requires the local scientific engine.
          </Notice>
          <div className="sample-gallery">
            {samples.map((s) => (
              <button
                className="sample-tile"
                key={s.id}
                onClick={() => selectSample(s)}
              >
                <div>
                  <img src={s.path} alt={s.id} />
                </div>
                <span>{s.id}</span>
                <small>Available notebook example</small>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="results-count" aria-live="polite">
            {loading
              ? "Loading cohort…"
              : `${data?.total || 0} matching images · page ${page} of ${data?.pages || 1}`}
          </div>
          <div className={`cohort-grid ${loading ? "loading" : ""}`}>
            {data?.items?.map((s, i) => (
              <button
                className="cohort-tile"
                key={s.id}
                onClick={() => selectCohort(s)}
              >
                <div>
                  <img
                    src={`${BASE}/cohort/${s.id}/image?thumbnail=true`}
                    alt={`${s.disease} dataset example, ${s.sequence}`}
                    loading="lazy"
                  />
                  <span>
                    {String((page - 1) * 18 + i + 1).padStart(3, "0")}
                  </span>
                  <ArrowUpRight size={17} />
                </div>
                <div>
                  <strong>{s.disease}</strong>
                  <Tag>{s.sequence}</Tag>
                </div>
                <small>
                  {s.width} × {s.height} · {s.split}
                </small>
              </button>
            ))}
          </div>
          {!loading && data?.total === 0 && (
            <Notice>
              No images match these filters. Try another sequence or split.
            </Notice>
          )}
          <div className="pagination">
            <Button
              secondary
              disabled={page <= 1 || loading}
              onClick={() => {
                setLoading(true);
                setPage((p) => p - 1);
              }}
            >
              Previous
            </Button>
            <span>
              Page {page} / {data?.pages || 1}
            </span>
            <Button
              secondary
              disabled={page >= (data?.pages || 1) || loading}
              onClick={() => {
                setLoading(true);
                setPage((p) => p + 1);
              }}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </>
  );
}

function Predictions({ ml }) {
  return (
    <div className="ms-card predictions">
      <div className="card-heading">
        <h3>Experimental classification</h3>
        <Tag>Separate from the ROI</Tag>
      </div>
      {ml?.status === "ready" ? (
        <>
          <p>
            Medulloblastoma class score. Each classifier uses its
            validation-selected threshold; these scores are not validated
            clinical probabilities.
          </p>
          {ml.predictions.map((p) => (
            <div className="prediction-row" key={p.id}>
              <div>
                <strong>
                  {p.family === "svm" ? "Feature SVM" : "MobileNetV2"}
                </strong>
                <span>
                  {p.variant === "sip"
                    ? "SIP-preprocessed"
                    : "Original intensity"}
                </span>
              </div>
              <div className="score-track">
                <i style={{ width: `${p.score * 100}%` }} />
                <b
                  style={{ left: `${p.threshold * 100}%` }}
                  title={`Threshold ${p.threshold.toFixed(3)}`}
                />
              </div>
              <strong>{pct(p.score)}</strong>
              <Tag tone={p.label === "Medulloblastoma-like" ? "" : "muted"}>
                {p.label}
              </Tag>
            </div>
          ))}
          <Notice>{ml.note}</Notice>
          <small>
            Artifact {ml.model_version} · {ml.preprocessing_version}
          </small>
        </>
      ) : (
        <Notice>
          {ml?.message ||
            "Run “Analyze & save” to obtain model outputs for this image. No prediction is implied by a candidate contour or a dataset label."}
        </Notice>
      )}
    </div>
  );
}

export function CaseWorkspace({
  session,
  samples,
  setUpload,
  selectedFile,
  sequence,
  setSequence,
  run,
  busy,
  error,
  selectSample,
  refreshSessions,
  setSession,
}) {
  const [tab, setTab] = useState("compare"),
    [after, setAfter] = useState("contrast_stretched"),
    [notes, setNotes] = useState(session?.notes || ""),
    [saveMessage, setSaveMessage] = useState(""),
    [exporting, setExporting] = useState(false),
    [exportError, setExportError] = useState("");
  async function saveNotes() {
    try {
      await jsonPost(`/sessions/${session.sessionId}/notes`, { notes }, "PUT");
      setSession({ ...session, notes });
      setSaveMessage("Notes saved.");
      refreshSessions();
    } catch (e) {
      setSaveMessage(e.message);
    }
  }
  async function exportPdf() {
    setExporting(true);
    setExportError("");
    try {
      const response = await fetch(`${BASE}/report/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...session,
          notes,
          step_images_b64: await inlineImages(session.step_images),
        }),
      });
      if (!response.ok)
        throw new Error(
          "Report generation failed. Check that the scientific engine is running.",
        );
      download(await response.blob(), `MedulloSight-${session.filename}.pdf`);
    } catch (e) {
      setExportError(e.message);
    } finally {
      setExporting(false);
    }
  }
  return (
    <>
      <SectionTitle
        eyebrow="CASE ANALYSIS"
        title="Keep the whole investigation in view."
        action={
          <Button
            onClick={() => run({ persist: true, include_ml: true })}
            disabled={busy}
          >
            {busy ? "Analyzing…" : "Analyze & save"} <ArrowRight size={16} />
          </Button>
        }
      >
        Original image, experimental class scores, classical candidate,
        measurements and research notes—in one place.
      </SectionTitle>
      <div className="ingestion-bar">
        <label className="upload-button">
          <Upload size={17} />
          <span>{selectedFile?.name || "Upload a 2D MRI slice"}</span>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.tif,.tiff,.bmp,.dcm"
            disabled={busy}
            onChange={(e) => e.target.files[0] && setUpload(e.target.files[0])}
          />
        </label>
        <label>
          Sequence
          <select
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
          >
            {["Unknown", "T1", "T1C+", "T2"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Or a notebook example
          <select
            aria-label="Choose a notebook example"
            value=""
            disabled={busy}
            onChange={(e) =>
              selectSample(samples.find((s) => s.id === e.target.value))
            }
          >
            <option value="" disabled>
              Choose an example
            </option>
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} · {s.sequence}
              </option>
            ))}
          </select>
        </label>
        <span>JPEG · PNG · WebP · TIFF · BMP · single-frame DICOM / 30 MB</span>
      </div>
      {selectedFile && (
        <Notice>
          A new upload is selected: <strong>{selectedFile.name}</strong>. The
          results below belong to the previous case until you run “Analyze &
          save”.
        </Notice>
      )}
      {error && <Notice error>{error}</Notice>}
      {session ? (
        <>
          <div className="case-metadata">
            <div>
              <FileImage size={17} />
              <strong>{session.filename}</strong>
              <Tag>{session.sequence}</Tag>
              <span>
                {session.dimensions.width} × {session.dimensions.height}
              </span>
            </div>
            <div>
              <Tag tone="muted">
                {session.pipeline_version || "notebook-v1"}
              </Tag>
              <Tag tone={session.demo ? "amber" : ""}>
                {session.preview
                  ? "Unsaved experiment"
                  : session.demo
                    ? "Precomputed demonstration"
                    : "Saved case"}
              </Tag>
            </div>
          </div>
          {session.source?.dataset_label && (
            <Notice>
              Supplied dataset label:{" "}
              <strong>{session.source.dataset_label}</strong> · Source split:{" "}
              {session.source.split}. This is reference metadata, not a model
              finding.
            </Notice>
          )}
          <div className="case-layout">
            <div className="case-main">
              <div className="case-view-tabs segmented">
                {[
                  ["compare", "Compare"],
                  ["viewer", "Inspect image"],
                  ["edges", "Edge comparison"],
                  ["pipeline", "Pipeline walkthrough"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className={tab === id ? "active" : ""}
                    onClick={() => setTab(id)}
                  >
                    {label}
                  </button>
                ))}
                <select
                  aria-label="Select image output"
                  value={after}
                  onChange={(e) => setAfter(e.target.value)}
                >
                  {outputsFor(session).map((s) => (
                    <option key={s[0]} value={s[0]}>
                      {s[1]}
                    </option>
                  ))}
                </select>
              </div>
              {tab === "compare" ? (
                <Compare
                  before={session.step_images.raw}
                  after={session.step_images[after]}
                  afterLabel={
                    outputsFor(session).find((s) => s[0] === after)?.[1]
                  }
                />
              ) : tab === "viewer" ? (
                <Viewer
                  src={session.step_images[after]}
                  title={after.replaceAll("_", " ")}
                />
              ) : tab === "edges" ? (
                <div className="edge-grid">
                  {["sobel", "roberts", "prewitt", "laplacian"].map(
                    (operator) => (
                      <button
                        key={operator}
                        onClick={() => {
                          setAfter(`edge_${operator}`);
                          setTab("viewer");
                        }}
                      >
                        <img
                          src={session.step_images[`edge_${operator}`]}
                          alt={`${operator} gradient response`}
                        />
                        <strong>{operator}</strong>
                        <span>
                          Median-image input · independently normalized display
                        </span>
                      </button>
                    ),
                  )}
                </div>
              ) : (
                <StagePlayer session={session} />
              )}
              <Predictions ml={session.ml} />
              <Measurements session={session} />
              <div className="ms-card">
                <div className="card-heading">
                  <h3>Research notes</h3>
                  <Tag tone="muted">Stored with the case</Tag>
                </div>
                <textarea
                  aria-label="Case research notes"
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What changed? What needs checking? Record observations about this case."
                />
                <div className="notes-footer">
                  <span aria-live="polite">
                    {session.demo || session.preview
                      ? "Save this case before storing notes."
                      : saveMessage}
                  </span>
                  <Button
                    secondary
                    disabled={session.demo || session.preview}
                    onClick={saveNotes}
                  >
                    <Save size={15} />
                    Save notes
                  </Button>
                </div>
              </div>
            </div>
            <aside className="case-sidebar">
              <div className="ms-card">
                <span className="eyebrow">MEASURED ON THIS IMAGE</span>
                <div className="case-stat">
                  <span>Intensity spread</span>
                  <strong>
                    {num(session.metrics.initial_std)} <ArrowRight size={16} />{" "}
                    {num(session.metrics.stretched_std)}
                  </strong>
                  <small>Grayscale SD · [0–255]</small>
                </div>
                <div className="case-stat">
                  <span>Contrast spread change</span>
                  <strong>
                    {session.metrics.contrast_gain_percent === null
                      ? "Uniform input"
                      : `${num(session.metrics.contrast_gain_percent)}%`}
                  </strong>
                </div>
                <div className="case-stat">
                  <span>Classical candidate area</span>
                  <strong>{num(session.metrics.roi_area_percent)}%</strong>
                  <small>
                    {num(session.metrics.roi_area_pixels)} pixels · not tumour
                    volume
                  </small>
                </div>
                <div className="case-stat">
                  <span>Otsu threshold</span>
                  <strong>{session.metrics.otsu_threshold}</strong>
                </div>
                <Histogram
                  data={session.histogram_data?.segmentation_input}
                  threshold={session.metrics.otsu_threshold}
                />
                <small>Segmentation-input histogram · threshold in amber</small>
              </div>
              <div className="ms-card">
                <h3>Interpretation matters.</h3>
                <p>
                  The largest foreground component is an algorithmic candidate.
                  It does not establish tumour presence, location or extent.
                </p>
                {session.warnings?.length ? (
                  session.warnings.map((w) => (
                    <Notice key={w.code}>{w.message}</Notice>
                  ))
                ) : (
                  <Tag tone="muted">
                    No heuristic alerts · not proof of correctness
                  </Tag>
                )}
              </div>
              <div className="ms-card">
                <h3>Keep the evidence.</h3>
                <p>
                  Export this case with the input, processing parameters,
                  measurements and separate ML results.
                </p>
                <Button secondary disabled={exporting} onClick={exportPdf}>
                  <Download size={15} />
                  {exporting ? "Building report…" : "Download PDF"}
                </Button>
                <Button
                  secondary
                  onClick={() =>
                    download(
                      new Blob(
                        [JSON.stringify({ ...session, notes }, null, 2)],
                        { type: "application/json" },
                      ),
                      `MedulloSight-${session.sessionId}.json`,
                    )
                  }
                >
                  Export complete JSON
                </Button>
                {exportError && <Notice error>{exportError}</Notice>}
              </div>
            </aside>
          </div>
        </>
      ) : (
        <Notice>Select a notebook example or upload a slice to begin.</Notice>
      )}
    </>
  );
}

async function inlineImages(images) {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(images).map(async ([key, value]) => {
        if (value.startsWith("data:")) return [key, value];
        const r = await fetch(value);
        if (!r.ok)
          throw new Error("An image could not be loaded for the report");
        const blob = await r.blob();
        return [
          key,
          await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }),
        ];
      }),
    ),
  );
}

export function ExperimentLab({ session, run, busy, error }) {
  const [mode, setMode] = useState("notebook-v1"),
    [gamma, setGamma] = useState(0.5),
    [low, setLow] = useState(1),
    [high, setHigh] = useState(99),
    [kernel, setKernel] = useState(3),
    [cutoff, setCutoff] = useState(50),
    [radius, setRadius] = useState(7),
    [noise, setNoise] = useState(null),
    [noiseBusy, setNoiseBusy] = useState(false),
    [noiseError, setNoiseError] = useState("");
  async function benchmark() {
    setNoiseBusy(true);
    setNoiseError("");
    try {
      const response = await fetch(session.step_images.raw);
      const form = new FormData();
      form.append("file", await response.blob(), "reference.png");
      form.append("density", ".05");
      setNoise(
        await request("/benchmark/noise", { method: "POST", body: form }),
      );
    } catch (e) {
      setNoiseError(e.message);
    } finally {
      setNoiseBusy(false);
    }
  }
  const params = {
    pipeline_mode: mode,
    gamma,
    contrast_low_p: low,
    contrast_high_p: high,
    median_kernel: kernel,
    butterworth_d0: cutoff,
    morph_radius_large: radius,
    morph_radius_small: 3,
  };
  return (
    <>
      <SectionTitle
        eyebrow="EXPERIMENT LAB"
        title="Change a parameter. Inspect the consequence."
      >
        Re-run the classical pipeline on the active case. Experiments are
        previews until you explicitly save them.
      </SectionTitle>
      <div className="lab-layout">
        <aside className="ms-card lab-controls">
          <span className="eyebrow">CLASSICAL PROCESSING</span>
          <label>
            Processing path
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="notebook-v1">Notebook-aligned v1</option>
              <option value="experimental-v2">
                Gamma + FFT segmentation v2
              </option>
            </select>
          </label>
          {[
            ["Gamma exponent", gamma, setGamma, 0.1, 2, 0.1],
            ["Lower stretch percentile", low, setLow, 0, 5, 0.5],
            ["Upper stretch percentile", high, setHigh, 95, 100, 0.5],
            ["Butterworth cutoff", cutoff, setCutoff, 10, 100, 5],
            ["Morphology disk radius", radius, setRadius, 1, 12, 1],
          ].map(([label, value, setter, min, max, step]) => (
            <label key={label}>
              {label}
              <strong>{value}</strong>
              <input
                aria-label={label}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
              />
            </label>
          ))}
          <label>
            Median kernel
            <select
              value={kernel}
              onChange={(e) => setKernel(Number(e.target.value))}
            >
              {[3, 5, 7].map((x) => (
                <option key={x} value={x}>
                  {x} × {x}
                </option>
              ))}
            </select>
          </label>
          <Button
            disabled={busy || !session}
            onClick={() => run({ params, persist: false, include_ml: false })}
          >
            <FlaskConical size={16} />
            {busy ? "Computing…" : "Apply experiment"}
          </Button>
          <Button
            secondary
            disabled={busy || !session}
            onClick={() => run({ params, persist: true, include_ml: true })}
          >
            Save as a new case
          </Button>
          <Notice>
            Notebook mode thresholds the median-filtered contrast image. Gamma
            and FFT are parallel exploration branches. Experimental mode sends
            gamma → median → FFT into segmentation.
          </Notice>
        </aside>
        <div>
          {error && <Notice error>{error}</Notice>}
          <StagePlayer session={session} />
          <div className="ms-card">
            <h3>Model inputs stay reproducible.</h3>
            <p>
              Classifier comparisons always use their fixed, versioned ML
              preprocessing. The controls here explore the classical pipeline;
              they do not silently change the input policy of a trained model.
            </p>
            {session && (
              <Compare
                before={session.step_images.ml_raw}
                after={session.step_images.ml_sip}
                beforeLabel="ML raw input"
                afterLabel="Fixed SIP model input"
                compact
              />
            )}
          </div>
        </div>
      </div>
      <SectionTitle
        eyebrow="A CONTROLLED EXPERIMENT"
        title="Add noise. Measure recovery."
      >
        A reproducible 5% impulse-noise experiment against the active image as
        reference. PSNR measures this filtering experiment, not tumour-detection
        accuracy.
      </SectionTitle>
      <div className="ms-card">
        <Button secondary disabled={noiseBusy || !session} onClick={benchmark}>
          {noiseBusy ? "Running noise experiment…" : "Run noise benchmark"}
        </Button>
        {noiseError && <Notice error>{noiseError}</Notice>}
        {noise && (
          <>
            <div className="metric-pair">
              <Stat
                label="Noisy input PSNR"
                value={
                  noise.noisy_metrics.exact_match
                    ? "∞ dB · exact match"
                    : `${noise.noisy_metrics.psnr} dB`
                }
              />
              <Stat
                label="After median filtering"
                value={
                  noise.filtered_metrics.exact_match
                    ? "∞ dB · exact match"
                    : `${noise.filtered_metrics.psnr} dB`
                }
              />
            </div>
            <Compare
              before={noise.noisy_image}
              after={noise.filtered_image}
              beforeLabel="Synthetic noise"
              afterLabel="Median-filtered"
            />
          </>
        )}
      </div>
    </>
  );
}
