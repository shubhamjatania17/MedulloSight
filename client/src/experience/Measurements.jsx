import React from "react";
import { num } from "./api";

export default function Measurements({ session }) {
  const m = session.metrics;
  return (
    <>
      <details className="ms-card measurement-details">
        <summary>Intensity and candidate measurements</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Intensity statistic</th>
                <th>Original grayscale</th>
                <th>Contrast stretched</th>
              </tr>
            </thead>
            <tbody>
              {[
                "mean",
                "median",
                "std",
                "min",
                "max",
                "dynamic_range",
                "entropy",
              ].map((key) => (
                <tr key={key}>
                  <td>{key.replaceAll("_", " ")}</td>
                  <td>{num(m.initial_metrics?.[key])}</td>
                  <td>{num(m.stretched_metrics?.[key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Intensity statistics use grayscale levels [0–255]. Shannon entropy is
          in bits.
        </p>
        <dl className="result-dl">
          <div>
            <dt>Foreground area</dt>
            <dd>{num(m.foreground_percent)}%</dd>
          </div>
          <div>
            <dt>Components before / after opening</dt>
            <dd>
              {m.cc_count_before_open} / {m.cc_count_after_open}
            </dd>
          </div>
          <div>
            <dt>Component reduction</dt>
            <dd>{num(m.cc_reduction_percent)}%</dd>
          </div>
          <div>
            <dt>Candidate bounding box [y, x, y, x]</dt>
            <dd>{m.roi_bbox?.join(", ")}</dd>
          </div>
          <div>
            <dt>Candidate centroid [y, x]</dt>
            <dd>{m.centroid?.map(num).join(", ")}</dd>
          </div>
        </dl>
      </details>
      <details className="ms-card measurement-details">
        <summary>Actual processing timings and parameters</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Operation</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {session.steps_log.map((step) => (
                <tr key={step.step}>
                  <td>{step.name}</td>
                  <td>{num(step.duration_ms)} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Classical pipeline total: {num(session.total_duration_ms)} ms.
          Encoding, database writes and ML inference are separate from this
          timing.
        </p>
        <pre>{JSON.stringify(session.parameters, null, 2)}</pre>
      </details>
    </>
  );
}
