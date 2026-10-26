import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { BASE, pct } from "./api";
import { Button, Notice, SectionTitle, Tag } from "./shared";

export default function ErrorReview({ models, inspect, online }) {
  const [variant, setVariant] = useState("raw");
  const [kind, setKind] = useState("missed");
  const [limit, setLimit] = useState(8);
  const model = models.find((item) => item.variant === variant);
  if (!model) return null;
  const rows = model.test_predictions.filter((row) => {
    const positive = row.score >= model.threshold;
    return kind === "missed"
      ? row.label === 1 && !positive
      : row.label === 0 && positive;
  });
  return (
    <>
      <SectionTitle
        eyebrow="INSPECT THE MISTAKES"
        title="An error is a case to understand."
      >
        Explore held-out false negatives and false positives. Opening one
        replays its analysis; it does not make it a new independent test case.
      </SectionTitle>
      <div className="evaluation-toolbar">
        <div
          className="segmented"
          role="group"
          aria-label="Error review input variant"
        >
          {["raw", "sip"].map((value) => (
            <button
              key={value}
              className={variant === value ? "active" : ""}
              onClick={() => {
                setVariant(value);
                setLimit(8);
              }}
            >
              {value === "raw" ? "Raw input" : "SIP input"}
            </button>
          ))}
        </div>
        <div className="segmented" role="group" aria-label="Error type">
          <button
            className={kind === "missed" ? "active" : ""}
            onClick={() => {
              setKind("missed");
              setLimit(8);
            }}
          >
            Missed medulloblastoma labels
          </button>
          <button
            className={kind === "false-positive" ? "active" : ""}
            onClick={() => {
              setKind("false-positive");
              setLimit(8);
            }}
          >
            Other labels predicted positive
          </button>
        </div>
      </div>
      {!online && (
        <Notice>
          Connect the local engine to open the original images. The recorded
          test scores below remain available from the training artifact.
        </Notice>
      )}
      <div className="error-review-grid">
        {rows.slice(0, limit).map((row) => (
          <article className="ms-card" key={row.image_id}>
            {online && (
              <img
                src={`${BASE}/cohort/${row.image_id}/image?thumbnail=true`}
                alt={`Held-out error example, ${row.sequence}`}
                loading="lazy"
              />
            )}
            <div className="card-heading">
              <strong>
                {row.label === 1
                  ? "Medulloblastoma label"
                  : row.path.split("/")[0]}
              </strong>
              <Tag>{row.sequence}</Tag>
            </div>
            <p>
              Class score {pct(row.score)} · threshold {pct(model.threshold)}
            </p>
            <Button
              secondary
              disabled={!online || !inspect}
              onClick={() =>
                inspect({ id: row.image_id, sequence: row.sequence })
              }
            >
              Inspect this case <ArrowUpRight size={14} />
            </Button>
          </article>
        ))}
      </div>
      {rows.length === 0 && (
        <Notice>
          No examples of this error type occurred for this model on the held-out
          test set.
        </Notice>
      )}
      {rows.length > limit && (
        <Button secondary onClick={() => setLimit((value) => value + 8)}>
          Show more errors
        </Button>
      )}
    </>
  );
}
