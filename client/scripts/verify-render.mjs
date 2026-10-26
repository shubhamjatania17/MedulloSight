// Server-side component rendering only. No browser is launched or automated.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = async (name) =>
  JSON.parse(
    await fs.readFile(path.join(root, "public/research", name), "utf8"),
  );
const [session, samples, evaluation] = await Promise.all(
  ["MB04_T1C.json", "samples.json", "evaluation.json"].map(read),
);
const server = await createServer({
  root,
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: "custom",
});
try {
  const { default: Landing } = await server.ssrLoadModule(
    "/src/experience/Landing.jsx",
  );
  const { Overview, CaseWorkspace, ExperimentLab, Cohort } =
    await server.ssrLoadModule("/src/experience/Workspace.jsx");
  const { Evaluation, Research, Batch } = await server.ssrLoadModule(
    "/src/experience/Evidence.jsx",
  );
  const noop = () => {};
  const cases = [
    [
      "landing",
      Landing,
      {
        samples,
        demo: session,
        evaluation,
        navigate: noop,
        selectSample: noop,
      },
    ],
    [
      "overview",
      Overview,
      {
        samples,
        evaluation,
        sessions: [],
        navigate: noop,
        selectSample: noop,
        loadSession: noop,
      },
    ],
    [
      "case",
      CaseWorkspace,
      {
        session,
        samples,
        sequence: "T1C+",
        setUpload: noop,
        setSequence: noop,
        run: noop,
        selectSample: noop,
        refreshSessions: noop,
        setSession: noop,
      },
    ],
    ["lab", ExperimentLab, { session, run: noop }],
    ["cohort", Cohort, { samples, selectSample: noop, selectCohort: noop }],
    ["evaluation", Evaluation, { evaluation, refresh: noop }],
    ["research", Research, { evaluation }],
    [
      "batch",
      Batch,
      { setSession: noop, refreshSessions: noop, navigate: noop },
    ],
  ];
  for (const [name, component, props] of cases) {
    const html = renderToStaticMarkup(React.createElement(component, props));
    assert(html.length > 500, `${name} rendered unexpectedly empty`);
    assert(!html.includes("NaN"), `${name} rendered NaN`);
    assert(!html.includes('src="undefined"'), `${name} has an undefined image`);
    console.log(`${name}: rendered ${html.length.toLocaleString()} characters`);
  }
  console.log(
    "All eight presentation/workspace views render with the real measured fixtures.",
  );
} finally {
  await server.close();
}
