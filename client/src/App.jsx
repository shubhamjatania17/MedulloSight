import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Database,
  FlaskConical,
  LayoutDashboard,
  Microscope,
  PanelLeftClose,
  PanelLeftOpen,
  ScanLine,
  Shapes,
  ChartNoAxesCombined,
} from "lucide-react";
import Landing from "./experience/Landing";
import {
  CaseWorkspace,
  Cohort,
  ExperimentLab,
  Overview,
} from "./experience/Workspace";
import { Batch, Evaluation, Research } from "./experience/Evidence";
import { Notice } from "./experience/shared";
import { getEvaluation, jsonPost, request } from "./experience/api";
import "./experience/styles.css";

const links = [
  ["overview", "Overview", LayoutDashboard],
  ["case", "Case analysis", ScanLine],
  ["cohort", "Cohort explorer", Shapes],
  ["lab", "Experiment lab", FlaskConical],
  ["evaluation", "Model evaluation", ChartNoAxesCombined],
  ["research", "Research & methods", BookOpen],
  ["batch", "Batch & export", Database],
];
function route() {
  const key = window.location.hash.replace(/^#\/app\/?/, "").split("?")[0];
  return window.location.hash.startsWith("#/app")
    ? links.some((l) => l[0] === key)
      ? key
      : "overview"
    : "landing";
}

export default function App() {
  const [view, setView] = useState(route),
    [samples, setSamples] = useState([]),
    [demo, setDemo] = useState(null),
    [session, setSession] = useState(null),
    [summary, setSummary] = useState(null),
    [evaluation, setEvaluation] = useState(null),
    [sessions, setSessions] = useState([]),
    [online, setOnline] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [selectedFile, setSelectedFile] = useState(null),
    [sequence, setSequence] = useState("T1C+"),
    [sidebar, setSidebar] = useState(false),
    [source, setSource] = useState("/mri/MB04_T1C.jpg");
  const navigate = useCallback((key) => {
    window.location.hash = key === "landing" ? "#/" : `#/app/${key}`;
    setView(key);
    setSidebar(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  useEffect(() => {
    const update = () => setView(route());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const refreshSessions = useCallback(async () => {
    try {
      const data = await request("/sessions");
      setSessions(data.sessions);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, []);
  const refreshModels = useCallback(async () => {
    try {
      const data = await getEvaluation();
      setEvaluation(data);
      if (!data.snapshot) setOnline(true);
    } catch (error) {
      setError(error.message);
    }
  }, []);
  useEffect(() => {
    let canceled = false;
    async function initialize() {
      try {
        const listResponse = await fetch("/research/samples.json");
        if (!listResponse.ok)
          throw new Error("Notebook examples are unavailable.");
        const list = await listResponse.json();
        const resultResponse = await fetch("/research/MB04_T1C.json");
        const result = await resultResponse.json();
        if (!canceled) {
          setSamples(list);
          setDemo(result);
          setSession((s) => s || result);
        }
        const previous = localStorage.getItem("medullosight-case");
        if (previous) {
          try {
            const loaded = await request(
              `/sessions/${encodeURIComponent(previous)}`,
            );
            if (!canceled) {
              setSession(loaded);
              setSequence(loaded.sequence);
              setSource(loaded.step_images.raw);
            }
          } catch (error) {
            if (error.status === 404)
              localStorage.removeItem("medullosight-case");
          }
        }
      } catch (e) {
        if (!canceled) setError(e.message);
      }
    }
    initialize();
    getEvaluation()
      .then((data) => {
        if (!canceled) {
          setEvaluation(data);
          if (!data.snapshot) setOnline(true);
        }
      })
      .catch(() => {});
    request("/sessions")
      .then((data) => {
        if (!canceled) {
          setSessions(data.sessions);
          setOnline(true);
        }
      })
      .catch(() => {
        if (!canceled) setOnline(false);
      });
    request("/cohort/summary")
      .then((data) => {
        if (!canceled) setSummary(data);
      })
      .catch(() => {});
    return () => {
      canceled = true;
    };
  }, []);
  useEffect(() => {
    const timer = setInterval(
      () =>
        request("/health")
          .then(() => setOnline(true))
          .catch(() => setOnline(false)),
      30000,
    );
    return () => clearInterval(timer);
  }, []);
  async function selectSample(sample) {
    if (!sample) return;
    setError("");
    try {
      const response = await fetch(sample.result_url);
      if (!response.ok) throw new Error("Could not load notebook example.");
      const result = await response.json();
      setSession(result);
      setSource(sample.path);
      setSelectedFile(null);
      setSequence(sample.sequence);
      navigate("case");
    } catch (e) {
      setError(e.message);
    }
  }
  async function selectCohort(item) {
    setBusy(true);
    setError("");
    try {
      const result = await jsonPost("/analyze/cohort", { image_id: item.id });
      setSession(result);
      setSource(result.step_images.raw);
      setSequence(item.sequence);
      setSelectedFile(null);
      localStorage.setItem("medullosight-case", result.sessionId);
      refreshSessions();
      navigate("case");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function run({ params = {}, persist = true, include_ml = true } = {}) {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      if (selectedFile) form.append("file", selectedFile, selectedFile.name);
      else {
        const response = await fetch(source);
        if (!response.ok)
          throw new Error("Could not load the active source image.");
        form.append(
          "file",
          await response.blob(),
          session?.filename || "MRI.png",
        );
      }
      form.append("sequence", sequence);
      form.append("persist", String(persist));
      form.append("include_ml", String(include_ml));
      Object.entries(params).forEach(([k, v]) => form.append(k, String(v)));
      const result = await request("/analyze/single", {
        method: "POST",
        body: form,
      });
      setSession({ ...result, preview: !persist });
      setSource(result.step_images.raw);
      setSelectedFile(null);
      if (persist) {
        localStorage.setItem("medullosight-case", result.sessionId);
        await refreshSessions();
      }
      setOnline(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function setUpload(file) {
    setSelectedFile(file);
    const name = file.name.toLowerCase();
    setSequence(
      name.includes("t1c")
        ? "T1C+"
        : name.includes("t1")
          ? "T1"
          : name.includes("t2")
            ? "T2"
            : "Unknown",
    );
    setError("");
  }
  async function loadSession(id) {
    setBusy(true);
    try {
      const result = await request(`/sessions/${encodeURIComponent(id)}`);
      setSession(result);
      setSource(result.step_images.raw);
      setSelectedFile(null);
      setSequence(result.sequence);
      localStorage.setItem("medullosight-case", id);
      navigate("case");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (view === "landing")
    return (
      <Landing
        samples={samples}
        demo={demo}
        evaluation={evaluation}
        summary={summary}
        navigate={navigate}
        selectSample={selectSample}
      />
    );
  return (
    <div className="workspace-shell">
      <a className="skip-link" href="#workspace-main">
        Skip to workspace
      </a>
      <aside className={`workspace-nav ${sidebar ? "open" : ""}`}>
        <a href="#/" className="wordmark">
          <span className="brand-icon">
            <Microscope size={20} />
          </span>
          Medullo<span>Sight</span>
        </a>
        <span className="nav-caption">THE RESEARCH WORKSPACE</span>
        <nav aria-label="Workspace navigation">
          {links.map(([id, label, Icon]) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => navigate(id)}
              aria-current={view === id ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
              {view === id && <span />}
            </button>
          ))}
        </nav>
        <div className="nav-bottom">
          <div className="nav-research-note">
            <FlaskConical size={19} />
            <strong>A question worth exploring.</strong>
            <p>
              Does classical preprocessing help medulloblastoma classification?
            </p>
          </div>
          <button onClick={() => navigate("landing")}>
            <ArrowLeft size={15} />
            Back to the study
          </button>
          <small>
            Research & education only.
            <br />
            No clinical diagnosis.
          </small>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-header">
          <div>
            <button
              className="menu-toggle"
              aria-label={sidebar ? "Close navigation" : "Open navigation"}
              onClick={() => setSidebar((x) => !x)}
            >
              {sidebar ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeftOpen size={20} />
              )}
            </button>
            <span>
              MedulloSight{" "}
              <span className="breadcrumb">
                / {links.find((l) => l[0] === view)?.[1]}
              </span>
            </span>
          </div>
          <div>
            <span className={`engine-status ${online ? "online" : ""}`}>
              <i />
              {online ? "Local engine connected" : "Offline preview"}
            </span>
            <a href="#/app/research">
              Research scope <ArrowUpRight size={13} />
            </a>
          </div>
        </header>
        <main id="workspace-main" className="workspace-content">
          {busy && view !== "case" && view !== "lab" && (
            <div className="global-processing" role="status">
              Computing the case with the scientific engine…
            </div>
          )}
          {error && view !== "case" && view !== "lab" && (
            <Notice error>{error}</Notice>
          )}
          {view === "overview" && (
            <Overview
              {...{
                samples,
                summary,
                evaluation,
                sessions,
                navigate,
                selectSample,
                loadSession,
              }}
            />
          )}
          {view === "cohort" && (
            <Cohort {...{ selectCohort, samples, selectSample }} />
          )}
          {view === "case" && (
            <CaseWorkspace
              key={session?.sessionId}
              {...{
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
              }}
            />
          )}
          {view === "lab" && (
            <ExperimentLab {...{ session, run, busy, error }} />
          )}
          {view === "evaluation" && (
            <Evaluation
              evaluation={evaluation}
              refresh={refreshModels}
              inspect={selectCohort}
              online={online}
            />
          )}
          {view === "research" && <Research evaluation={evaluation} />}
          {view === "batch" && (
            <Batch
              setSession={(result) => {
                setSession(result);
                setSource(result.step_images.raw);
                setSequence(result.sequence);
                setSelectedFile(null);
                localStorage.setItem("medullosight-case", result.sessionId);
              }}
              {...{ refreshSessions, navigate }}
            />
          )}
        </main>
        <footer className="workspace-footer">
          <span>Medulloblastoma-focused image computing</span>
          <span>
            Classical SIP + experimental ML ·{" "}
            {evaluation?.preprocessing_version || "versioned methods"}
          </span>
        </footer>
      </div>
    </div>
  );
}
