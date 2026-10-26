import { BASE, num, pct, request } from "./api";
import ErrorReview from "./ErrorReview";
import React, { useEffect, useState } from "react";
import {
  Download,
  FileText,
  ArrowUpRight,
  Check,
  Database,
  FlaskConical,
  Layers,
} from "lucide-react";
import { Button, Notice, SectionTitle, Stat, Tag } from "./shared";
import { download } from "./download";

function Curve({ models, field, title }) {
  const colors = ["#216458", "#c68c5d"];
  return (
    <div className="ms-card curve-card">
      <h3>{title}</h3>
      <svg viewBox="0 0 360 240" role="img" aria-label={title}>
        <line x1="40" y1="200" x2="340" y2="200" stroke="#cbd5d1" />
        <line x1="40" y1="20" x2="40" y2="200" stroke="#cbd5d1" />
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line
              x1="40"
              x2="340"
              y1={200 - v * 180}
              y2={200 - v * 180}
              stroke="#e6e9e3"
            />
            <text x="12" y={204 - v * 180}>
              {v}
            </text>
            <text x={36 + v * 300} y="219">
              {v}
            </text>
          </g>
        ))}
        {models.map((m, i) => (
          <polyline
            key={m.id}
            points={m.test[field]
              ?.map(([x, y]) => `${40 + x * 300},${200 - y * 180}`)
              .join(" ")}
            fill="none"
            stroke={colors[i]}
            strokeWidth="2.5"
          />
        ))}
        <text x="140" y="238">
          {field === "pr_curve" ? "Recall" : "False-positive rate"}
        </text>
      </svg>
      <div className="curve-legend">
        {models.map((m, i) => (
          <span key={m.id}>
            <i style={{ background: colors[i] }} />
            {m.variant === "sip" ? "SIP input" : "Raw input"}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Evaluation({ evaluation, error, refresh, inspect, online }) {
  const [family, setFamily] = useState("svm");
  const models = evaluation?.models?.filter((m) => m.family === family) || [];
  const selected = evaluation?.models?.find(
    (m) => m.id === evaluation.default_model,
  );
  return (
    <>
      <SectionTitle
        eyebrow="MODEL EVALUATION"
        title="The evidence, including the trade-offs."
        action={
          <Button
            secondary
            onClick={() =>
              evaluation &&
              download(
                new Blob([JSON.stringify(evaluation, null, 2)], {
                  type: "application/json",
                }),
                "MedulloSight-evaluation.json",
              )
            }
            disabled={!evaluation?.models?.length}
          >
            <Download size={15} />
            Export results
          </Button>
        }
      >
        Raw and SIP classifiers share the same frozen training, validation and
        test image groups. Thresholds and the default model are selected using
        validation data only.
      </SectionTitle>
      {!models.length ? (
        <Notice error>
          {error || "No trained evaluation artifact is available."}{" "}
          <button onClick={refresh}>Retry</button>
        </Notice>
      ) : (
        <>
          <div className="stat-grid">
            <Stat
              label="Training images"
              value={num(evaluation.split_counts.train)}
              detail={`${evaluation.split_class_counts.train.Medulloblastoma} medulloblastoma-labelled`}
            />
            <Stat
              label="Validation images"
              value={num(evaluation.split_counts.validation)}
              detail="Threshold and default selection"
            />
            <Stat
              label="Held-out test images"
              value={num(evaluation.split_counts.test)}
              detail={`${evaluation.split_class_counts.test.Medulloblastoma} medulloblastoma-labelled`}
            />
            <Stat
              label="Patient-level validation"
              value="Unverified"
              detail="Similarity groups do not prove patient identity"
            />
          </div>
          <Notice>
            The default is{" "}
            <strong>{evaluation.default_model.replaceAll("_", " / ")}</strong>,
            chosen by validation F1 ({pct(selected.validation.f1)}). Test
            results are reported without changing that selection. All metrics
            are experimental image-level measurements.
            {evaluation.snapshot &&
              " This is the saved training-artifact snapshot; the engine is offline."}
          </Notice>
          <div className="evaluation-toolbar">
            <div className="segmented">
              <button
                className={family === "svm" ? "active" : ""}
                onClick={() => setFamily("svm")}
              >
                Classical features + SVM
              </button>
              <button
                className={family === "mobilenet" ? "active" : ""}
                onClick={() => setFamily("mobilenet")}
              >
                MobileNetV2 transfer learning
              </button>
            </div>
            <Tag>{evaluation.preprocessing_version}</Tag>
          </div>
          <div className="evaluation-cards">
            {models.map((m) => (
              <div className={`ms-card model-result ${m.variant}`} key={m.id}>
                <div className="card-heading">
                  <div>
                    <span className="eyebrow">
                      {m.variant === "sip"
                        ? "SIP-PREPROCESSED INPUT"
                        : "ORIGINAL-INTENSITY INPUT"}
                    </span>
                    <h3>
                      {m.family === "svm"
                        ? "Feature SVM"
                        : "MobileNetV2 + logistic regression"}
                    </h3>
                  </div>
                  {evaluation.default_model === m.id && (
                    <Tag>Validation-selected default</Tag>
                  )}
                </div>
                <div className="metric-pair">
                  <Stat
                    label="Medulloblastoma recall"
                    value={pct(m.test.recall)}
                  />
                  <Stat
                    label="Medulloblastoma precision"
                    value={pct(m.test.precision)}
                  />
                </div>
                <dl className="result-dl">
                  {[
                    ["F1 score", num(m.test.f1)],
                    ["Balanced accuracy", pct(m.test.balanced_accuracy)],
                    ["Precision–recall AUC", num(m.test.pr_auc)],
                    ["Specificity", pct(m.test.specificity)],
                    ["Validation F1", num(m.validation.f1)],
                    ["Decision threshold", m.threshold.toFixed(4)],
                  ].map(([name, value]) => (
                    <div key={name}>
                      <dt>{name}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <h4>Confusion matrix · test set</h4>
                <div className="confusion-label">
                  Rows: dataset label · columns: model prediction
                </div>
                <div className="confusion">
                  <span />
                  <span>Other</span>
                  <span>Medullo.</span>
                  <span>Other</span>
                  <strong className="correct">
                    {m.test.confusion_matrix[0][0]}
                  </strong>
                  <strong>{m.test.confusion_matrix[0][1]}</strong>
                  <span>Medullo.</span>
                  <strong>{m.test.confusion_matrix[1][0]}</strong>
                  <strong className="correct">
                    {m.test.confusion_matrix[1][1]}
                  </strong>
                </div>
              </div>
            ))}
          </div>
          <div className="two-columns">
            <Curve
              models={models}
              field="pr_curve"
              title="Precision–recall curve"
            />
            <Curve models={models} field="roc_curve" title="ROC curve" />
          </div>
          <ErrorReview
            key={family}
            models={models}
            inspect={inspect}
            online={online}
          />
          <SectionTitle
            eyebrow="LOOK BEYOND THE AGGREGATE"
            title="Results by MRI sequence."
          />
          <div className="ms-card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Model input</th>
                  <th>Sequence</th>
                  <th>Images</th>
                  <th>Positive images</th>
                  <th>Recall</th>
                  <th>Precision</th>
                  <th>F1</th>
                </tr>
              </thead>
              <tbody>
                {models.flatMap((m) =>
                  Object.entries(m.by_sequence).map(([seq, r]) => (
                    <tr key={`${m.id}-${seq}`}>
                      <td>{m.variant === "sip" ? "SIP" : "Raw"}</td>
                      <td>
                        <Tag>{seq}</Tag>
                      </td>
                      <td>{r.n}</td>
                      <td>{r.positive_n}</td>
                      <td>{pct(r.recall)}</td>
                      <td>{pct(r.precision)}</td>
                      <td>{num(r.f1)}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
          <div className="two-columns">
            <div className="ms-card">
              <h3>How this experiment was separated</h3>
              <p>{evaluation.grouping}</p>
              <ul className="check-list">
                <li>
                  <Check size={15} />
                  No exact pixel group crosses training, validation or test.
                </li>
                <li>
                  <Check size={15} />
                  Calibration uses group-separated training folds.
                </li>
                <li>
                  <Check size={15} />
                  Notebook groups are reserved for demonstrations.
                </li>
                <li>
                  <Check size={15} />
                  No augmentation is applied before the split.
                </li>
              </ul>
              <div className="split-bars">
                {Object.entries(evaluation.split_counts).map(
                  ([label, count]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <i style={{ width: `${(count / 4479) * 100}%` }} />
                      <strong>{count}</strong>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="ms-card">
              <h3>What this experiment cannot establish</h3>
              <ul className="limitations">
                {evaluation.limitations.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p>
                There are {evaluation.split_class_counts.test.Medulloblastoma}{" "}
                positive test images. Sequence-level estimates use even smaller
                samples; interpret sample counts alongside percentages.
              </p>
              <small>
                Artifact {evaluation.version} · seed {evaluation.seed}
              </small>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function Research({ evaluation }) {
  const [open, setOpen] = useState("methods");
  const sections = [
    ["methods", "Methodology"],
    ["data", "Dataset & splits"],
    ["limits", "Scope & limitations"],
  ];
  return (
    <>
      <SectionTitle
        eyebrow="RESEARCH & REPRODUCIBILITY"
        title="A clear line from the notebook to the extension."
      >
        The original classical SIP study and the new classification experiments
        are distinct parts of the same investigation.
      </SectionTitle>
      <div className="research-feature">
        <span className="eyebrow">THE RESEARCH QUESTION</span>
        <h2>
          Does classical preprocessing improve experimental medulloblastoma
          classification?
        </h2>
        <p>
          The answer depends on the classifier and held-out data. A more
          enhanced-looking image does not guarantee a better model.
        </p>
        <div>
          <Tag>Medulloblastoma versus other dataset categories</Tag>
          <Tag tone="amber">Research and education only</Tag>
        </div>
      </div>
      <div className="segmented research-tabs">
        {sections.map(([id, title]) => (
          <button
            key={id}
            className={open === id ? "active" : ""}
            onClick={() => setOpen(id)}
          >
            {title}
          </button>
        ))}
      </div>
      {open === "methods" ? (
        <div className="research-articles">
          <article className="ms-card">
            <FlaskConical size={25} />
            <span className="eyebrow">01 / ORIGINAL WORK</span>
            <h3>Classical SIP, made inspectable</h3>
            <p>
              The bundled notebook processes ten labelled MRI images with
              contrast stretching, gamma experiments, histogram equalization,
              filtering, edge detection, thresholding and morphology.
            </p>
            <p>
              The default notebook-v1 web path sends contrast stretch → median →
              Otsu → opening → largest component → closing. Gamma, histogram and
              FFT are parallel inspection branches. Experimental-v2 sends gamma
              → median → Butterworth low-pass into Otsu.
            </p>
            <p>
              The web implementation uses SciPy/Pillow equivalents and an Otsu
              plateau-midpoint rule. It follows the notebook's dataflow but does
              not claim byte-identical OpenCV results.
            </p>
            <code>10 classical operations + candidate extraction</code>
          </article>
          <article className="ms-card">
            <Layers size={25} />
            <span className="eyebrow">02 / NEW EXTENSION</span>
            <h3>Paired classification experiments</h3>
            <p>
              Each model is trained twice: once on original grayscale inputs,
              and once after fixed percentile stretching, gamma correction and
              median filtering. Aspect ratio is preserved before resizing.
            </p>
            <p>
              The SVM uses intensity histograms, texture, gradients, DCT
              coefficients and HOG. The transfer model uses frozen ImageNet
              MobileNetV2 embeddings with a trained logistic-regression head;
              the backbone is not fine-tuned.
            </p>
            <p>
              Interactive classical controls do not change a classifier's fixed
              input policy. Raw and SIP outputs are displayed separately, with
              their own validation-selected thresholds.
            </p>
            <code>
              {evaluation?.preprocessing_version || "sip-ml-v1"} · shared
              training/inference preprocessing
            </code>
          </article>
        </div>
      ) : open === "data" ? (
        <div className="research-articles">
          <article className="ms-card">
            <Database size={25} />
            <h3>The supplied dataset</h3>
            <p>
              The archive contains 4,479 images in 44 sequence/category folders.
              There are 15 category labels, including normal images.
              Medulloblastoma contributes 131 images: 23 T1, 67 T1C+ and 41 T2.
            </p>
            <p>
              Labels come from folder names and have not been independently
              clinically verified. The broad astrocytoma label does not specify
              a subtype or establish a matched posterior-fossa cohort.
            </p>
            <p>
              The audit found 50 excess pixel-identical copies. Perceptual
              similarity identifies related-image candidates; it cannot
              establish patient identity.
            </p>
          </article>
          <article className="ms-card">
            <h3>Frozen splits and durable cases</h3>
            <p>
              Similarity-connected groups remain within a single experimental
              split. Mixed-category groups are quarantined; notebook groups are
              excluded from both fitting and evaluation.
            </p>
            <p>
              Scaling, classification and calibration are fitted on training
              data. Validation selects decision thresholds and the default
              model. The test set is used only for final reported evaluation.
            </p>
            <p>
              Complete cases and batch records persist in SQLite. The ZIP
              remains the read-only source of cohort images.
            </p>
          </article>
        </div>
      ) : (
        <div className="ms-card prose">
          <h3>Keep the claims proportional to the evidence.</h3>
          <p>
            MedulloSight is an educational research application. It does not
            diagnose medulloblastoma, confirm tumour presence or provide a
            clinically validated probability.
          </p>
          <ul>
            {(
              evaluation?.limitations || [
                "No verified patient identifiers or patient-level validation.",
                "No expert tumour masks for segmentation validation.",
                "Supplied image labels are not independently clinically verified.",
              ]
            ).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p>
            The classical candidate and classifier answer different questions. A
            component contour does not become a ground-truth tumour boundary
            when a classifier returns a medulloblastoma-like score.
          </p>
          <p>
            Previously reported notebook or paper benchmarks are historical
            observations. This workspace displays per-image computations and
            artifact-backed evaluation.
          </p>
        </div>
      )}
      <div className="team-section">
        <span className="eyebrow">RESEARCH TEAM</span>
        <div>
          {[
            ["MS", "Mahirie Shah", "I033"],
            ["SJ", "Shubham Jatania", "I034"],
            ["KK", "Krish Karanpuria", "I035"],
          ].map(([initials, name, roll]) => (
            <article key={roll}>
              <span>{initials}</span>
              <div>
                <strong>{name}</strong>
                <small>{roll} · Signal & Image Processing</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

export function Batch({ setSession, refreshSessions, navigate }) {
  const [files, setFiles] = useState([]),
    [result, setResult] = useState(null),
    [sequence, setSequence] = useState("Unknown"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  useEffect(() => {
    let mounted = true;
    request("/batches")
      .then((data) => {
        if (mounted) setHistory(data.batches);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  async function restore(id) {
    setBusy(true);
    setError("");
    try {
      setResult(await request(`/batches/${encodeURIComponent(id)}`));
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function execute() {
    if (!files.length) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      form.append("sequence", sequence);
      const data = await request("/analyze/batch", {
        method: "POST",
        body: form,
      });
      setResult(data);
      request("/batches")
        .then((data) => setHistory(data.batches))
        .catch(() => {});
      refreshSessions();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <SectionTitle
        eyebrow="BATCH ANALYSIS & EXPORT"
        title="One workflow. Multiple slices."
      >
        Process up to 20 images with the default classical path and trained
        classifiers. Each successful result is saved as a complete case.
      </SectionTitle>
      <div className="ms-card batch-ingestion">
        <label className="upload-drop">
          <FileText size={30} />
          <strong>
            {files.length
              ? `${files.length} images selected`
              : "Choose MRI images"}
          </strong>
          <span>
            JPEG, PNG, WebP, TIFF, BMP or single-frame DICOM · up to 30 MB per
            file
          </span>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.tif,.tiff,.bmp,.dcm"
            onChange={(e) => {
              const selected = Array.from(e.target.files);
              if (selected.length > 20) {
                setError("Select at most 20 files.");
                return;
              }
              setFiles(selected);
              setError("");
            }}
          />
        </label>
        <div className="filter-row">
          <label>
            Sequence for this batch
            <select
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
            >
              {["Unknown", "T1", "T1C+", "T2"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <Button disabled={busy || !files.length} onClick={execute}>
            {busy ? "Processing batch…" : "Analyze & save batch"}
          </Button>
        </div>
        <p>
          Processing is sequential. For mixed-sequence batches choose “Unknown”.
        </p>
        {busy && (
          <Notice>
            Processing {files.length} images. Results appear when all files have
            completed.
          </Notice>
        )}
        {error && <Notice error>{error}</Notice>}
      </div>
      {history.length > 0 && (
        <div className="ms-card">
          <h3>Saved batch runs</h3>
          <p>
            Reload a completed batch to restore its results and exports,
            including after a server restart.
          </p>
          <div className="saved-batches">
            {history.map((batch) => (
              <button
                key={batch.batchId}
                className="text-link"
                disabled={busy}
                onClick={() => restore(batch.batchId)}
              >
                {new Date(batch.createdAt).toLocaleString()} ·{" "}
                {batch.successful}/{batch.total_files} completed{" "}
                <ArrowUpRight size={13} />
              </button>
            ))}
          </div>
        </div>
      )}
      {files.length > 0 && !result && (
        <div className="ms-card">
          <h3>Selected files</h3>
          <ul>
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`}>
                {f.name} · {(f.size / 1024 / 1024).toFixed(2)} MB
              </li>
            ))}
          </ul>
        </div>
      )}
      {result && (
        <>
          <div className="stat-grid">
            <Stat label="Submitted" value={result.total_files} />
            <Stat label="Completed" value={result.successful} />
            <Stat label="Failed" value={result.failed} />
            <Stat label="Storage" value="SQLite" />
          </div>
          <div className="batch-actions">
            <a
              className="ms-button secondary"
              href={`${BASE}/export/csv/${result.batchId}`}
            >
              <Download size={15} />
              Metrics CSV
            </a>
            <a
              className="ms-button secondary"
              href={`${BASE}/export/zip/${result.batchId}`}
            >
              <Download size={15} />
              Processed images ZIP
            </a>
          </div>
          <div className="ms-card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Candidate area</th>
                  <th>ML output</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {result.results.map((r, i) => (
                  <tr key={`${r.filename}-${i}`}>
                    <td>{r.filename}</td>
                    <td>{r.success ? "Saved" : r.error}</td>
                    <td>
                      {r.success ? `${num(r.metrics.roi_area_percent)}%` : "—"}
                    </td>
                    <td>
                      {r.ml?.predictions?.find(
                        (p) => p.id === r.ml.default_model,
                      )?.label || "—"}
                    </td>
                    <td>
                      {r.success && (
                        <button
                          className="text-link"
                          onClick={() => {
                            setSession(r);
                            navigate("case");
                          }}
                        >
                          Open case <ArrowUpRight size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
