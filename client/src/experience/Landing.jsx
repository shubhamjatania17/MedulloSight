import { num } from "./api";
import React, { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Layers,
  Microscope,
  MoveRight,
} from "lucide-react";
import { Button, Compare, LinkArrow, StagePlayer, Tag } from "./shared";

export default function Landing({
  samples,
  demo,
  evaluation,
  summary,
  navigate,
  selectSample,
}) {
  const [sequence, setSequence] = useState("All"),
    [variant, setVariant] = useState("contrast_stretched");
  const visible = samples.filter(
    (s) => sequence === "All" || s.sequence === sequence,
  );
  const main = evaluation?.models?.find(
    (m) => m.id === evaluation.default_model,
  );
  return (
    <div className="landing">
      <header className="landing-header">
        <a href="#/" className="wordmark">
          <span className="brand-icon">
            <Microscope size={20} />
          </span>
          Medullo<span>Sight</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#study">The study</a>
          <a href="#explore">Explore MRI</a>
          <a href="#evidence">The evidence</a>
        </nav>
        <Button onClick={() => navigate("overview")}>
          Open workspace <ArrowUpRight size={16} />
        </Button>
      </header>
      <main>
        <section className="hero ms-container">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" />
              An experimental MRI research workspace
            </span>
            <h1>
              Medulloblastoma.
              <br />A closer look.
              <br />
              <em>A clearer question.</em>
            </h1>
            <p>
              Explore the image. Understand the processing. Investigate whether
              classical enhancement helps a machine-learning model distinguish
              medulloblastoma from other dataset classes.
            </p>
            <div className="hero-actions">
              <Button onClick={() => navigate("case")}>
                Explore a case <ArrowRight size={17} />
              </Button>
              <LinkArrow onClick={() => navigate("research")}>
                Read the methodology
              </LinkArrow>
            </div>
            <div className="hero-footnote">
              <span>Classical image processing</span>
              <MoveRight size={15} />
              <span>Experimental classification</span>
            </div>
          </div>
          <div className="hero-imaging">
            <div className="hero-image-head">
              <span className="mono">CASE STUDY / MB04</span>
              <Tag>T1C+</Tag>
            </div>
            {demo ? (
              <Compare
                before={demo.step_images.raw}
                after={demo.step_images[variant]}
                afterLabel={
                  variant === "overlay_image"
                    ? "Classical candidate"
                    : variant === "edge_sobel"
                      ? "Sobel edges"
                      : "Contrast stretched"
                }
              />
            ) : (
              <div className="skeleton scan-skeleton" />
            )}
            <div className="hero-image-foot">
              <span>One scan. Different perspectives.</span>
              <select
                aria-label="Hero comparison output"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
              >
                <option value="contrast_stretched">Contrast enhancement</option>
                <option value="overlay_image">Candidate ROI</option>
                <option value="edge_sobel">Sobel edges</option>
              </select>
            </div>
            <div className="floating-annotation">
              <Layers size={18} />
              <div>
                <strong>See what changes.</strong>
                <span>Drag the comparison slider.</span>
              </div>
            </div>
          </div>
        </section>
        <div className="research-strip">
          <div className="ms-container">
            <div>
              <strong>{summary?.total?.toLocaleString() || "4,479"}</strong>
              <span>source images audited</span>
            </div>
            <div>
              <strong>131</strong>
              <span>medulloblastoma-labelled images</span>
            </div>
            <div>
              <strong>3</strong>
              <span>MRI sequences</span>
            </div>
            <div>
              <strong>{evaluation?.models?.length || "—"}</strong>
              <span>
                {evaluation?.models?.length
                  ? "trained model variants"
                  : "models awaiting availability"}
              </span>
            </div>
            <p>
              Research and education.
              <br />
              No clinical diagnosis.
            </p>
          </div>
        </div>
        <section className="ms-container condition-section">
          <div>
            <span className="eyebrow">WHY MEDULLOBLASTOMA?</span>
            <h2>
              A specific condition.
              <br />
              <em>A focused investigation.</em>
            </h2>
          </div>
          <div>
            <p>
              Medulloblastoma usually develops in the cerebellum, toward the
              back of the brain. Clinical diagnosis includes expert review of
              tumour tissue; an MRI image or a class score alone does not
              establish it.
            </p>
            <p>
              Our focus is narrower: study medulloblastoma-labelled MRI images,
              make their processing visible, and test classification against the
              other supplied categories.
            </p>
            <a
              className="text-link"
              href="https://www.cancer.gov/rare-brain-spine-tumor/tumors/medulloblastoma"
              target="_blank"
              rel="noreferrer"
            >
              Background: National Cancer Institute <ArrowUpRight size={14} />
            </a>
          </div>
        </section>
        <section className="ms-container study-section" id="study">
          <div className="section-number">01 / THE QUESTION</div>
          <div className="study-heading">
            <h2>
              More than a result.
              <br />
              <em>Understand how we get there.</em>
            </h2>
            <p>
              The notebook established a classical image-processing study on ten
              medulloblastoma MRI examples. This workspace extends that work
              with a larger labelled cohort, paired ML experiments, and an
              inspectable path from input to output.
            </p>
          </div>
          <div className="question-path">
            <article>
              <span>01</span>
              <h3>Inspect the input</h3>
              <p>
                Explore real T1, T1C+ and T2 images. Keep their dataset labels,
                dimensions and experimental split visible.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Make the process visible</h3>
              <p>
                Step through enhancement, filtering and candidate extraction.
                Compare the original image with each transformation.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Test the extension</h3>
              <p>
                Compare raw and SIP-preprocessed classifiers on identical
                held-out groups. Look at precision, recall and the mistakes.
              </p>
            </article>
          </div>
        </section>
        <section className="dark-section" id="explore">
          <div className="ms-container walkthrough-layout">
            <div>
              <span className="eyebrow">02 / INSIDE THE PIPELINE</span>
              <h2>
                Every transformation
                <br />
                <em>has a consequence.</em>
              </h2>
              <p>
                Scrub through an actual notebook example. Enhancement changes
                intensity; segmentation selects foreground. The candidate
                contour is a mathematical result, not a confirmed tumour
                boundary.
              </p>
              <div className="measured-callout">
                <span>Measured on the displayed example</span>
                <strong>
                  {num(demo?.metrics?.initial_std)} <MoveRight size={24} />{" "}
                  {num(demo?.metrics?.stretched_std)}
                </strong>
                <small>Standard deviation · grayscale [0–255]</small>
              </div>
              <Button secondary onClick={() => navigate("lab")}>
                Open the experiment lab <ArrowUpRight size={16} />
              </Button>
            </div>
            <StagePlayer session={demo} compact />
          </div>
        </section>
        <section className="ms-container archive-section">
          <div className="section-number">03 / THE ORIGINAL COHORT</div>
          <div className="section-title">
            <div>
              <h2>
                Real scans.
                <br />
                <em>Room to explore.</em>
              </h2>
              <p>
                The ten original notebook cases. Measurements are computed, and
                their groups are reserved from model training and evaluation.
              </p>
            </div>
            <div
              className="segmented"
              role="group"
              aria-label="Filter original cohort by MRI sequence"
            >
              {["All", "T1", "T1C+", "T2"].map((s) => (
                <button
                  key={s}
                  className={sequence === s ? "active" : ""}
                  onClick={() => setSequence(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="sample-gallery">
            {visible.map((s) => (
              <button
                key={s.id}
                className="sample-tile"
                onClick={() => selectSample(s)}
              >
                <div>
                  <img
                    src={s.path}
                    alt={`${s.id} original MRI`}
                    loading="lazy"
                  />
                  <ArrowUpRight size={17} />
                </div>
                <span>{s.id.replace("_", " · ")}</span>
                <small>
                  {s.dimensions.width} × {s.dimensions.height} · {s.sequence}
                </small>
              </button>
            ))}
          </div>
          <div className="archive-footer">
            <span>
              The full cohort includes all 131 medulloblastoma-labelled images.
            </span>
            <LinkArrow onClick={() => navigate("cohort")}>
              Explore the full dataset
            </LinkArrow>
          </div>
        </section>
        <section className="evidence-section" id="evidence">
          <div className="ms-container">
            <span className="eyebrow">04 / EVIDENCE OVER IMPRESSION</span>
            <div className="evidence-grid">
              <div>
                <h2>
                  Does preprocessing help?
                  <br />
                  <em>Let the experiment answer.</em>
                </h2>
                <p>
                  Two input variants. The same data split. An interpretable SVM
                  baseline alongside a frozen MobileNetV2 transfer-learning
                  classifier.
                </p>
                <Button onClick={() => navigate("evaluation")}>
                  Inspect model evaluation <ArrowUpRight size={16} />
                </Button>
              </div>
              <div className="evidence-paper">
                <div className="paper-label">
                  HELD-OUT EXPERIMENT /{" "}
                  {evaluation?.version?.slice(0, 8) || "AWAITING ARTIFACT"}
                </div>
                <h3>
                  {main
                    ? main.family === "svm"
                      ? "Classical features + SVM"
                      : "MobileNetV2 + linear classifier"
                    : "Evaluation is explicit."}
                </h3>
                <div className="evidence-numbers">
                  <div>
                    <strong>
                      {main ? `${(main.test.recall * 100).toFixed(1)}%` : "—"}
                    </strong>
                    <span>Medulloblastoma recall</span>
                  </div>
                  <div>
                    <strong>{main ? main.test.n : "—"}</strong>
                    <span>Held-out test images</span>
                  </div>
                </div>
                <p>
                  Model selected on validation F1. Similar images grouped before
                  splitting. Patient-level independence has not been
                  established.
                </p>
                <Tag tone="amber">Experimental · image-level evaluation</Tag>
              </div>
            </div>
          </div>
        </section>
        <section className="ms-container closing-section">
          <span className="eyebrow">FROM NOTEBOOK TO RESEARCH WORKSPACE</span>
          <h2>
            A focused study.
            <br />
            <em>An open investigation.</em>
          </h2>
          <p>
            Bring an MRI slice, explore the cohort, or replay the processing.
            Every result stays connected to its method and its limitations.
          </p>
          <Button onClick={() => navigate("overview")}>
            Enter MedulloSight <ArrowRight size={17} />
          </Button>
        </section>
      </main>
      <footer className="landing-footer ms-container">
        <a className="wordmark" href="#/">
          Medullo<span>Sight</span>
        </a>
        <span>Mahirie Shah · Shubham Jatania · Krish Karanpuria</span>
        <span>Research & education · 2026</span>
      </footer>
    </div>
  );
}
