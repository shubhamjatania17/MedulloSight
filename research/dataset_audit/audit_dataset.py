"""Inspect the source ZIP without extracting it or altering the application."""
import argparse
from collections import Counter, defaultdict
import hashlib
import io
import json
from pathlib import Path
import re
import zipfile

import numpy as np
from PIL import Image, ImageDraw, ImageOps
from scipy.fft import dctn


def duplicate_groups(records, field):
    groups = defaultdict(list)
    for record in records:
        if record.get(field):
            groups[record[field]].append(record)
    return [
        {
            "paths": [r["path"] for r in group],
            "disease_labels": sorted({r["disease_label"] for r in group}),
            "sequences": sorted({r["sequence"] for r in group}),
        }
        for group in groups.values() if len(group) > 1
    ]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", type=Path)
    parser.add_argument("--output", type=Path, default=Path(__file__).parent)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    records, failures, previews = [], [], []
    folder_counts, disease_counts, sequence_counts = Counter(), Counter(), Counter()
    with zipfile.ZipFile(args.archive) as archive:
        files = [f for f in archive.infolist() if not f.is_dir()]
        for index, info in enumerate(files):
            path = info.filename
            folder = path.rsplit("/", 1)[0] if "/" in path else ""
            match = re.fullmatch(r"(.+) (T1C\+|T1|T2)", folder)
            label, sequence = match.groups() if match else (folder, "Unknown")
            folder_counts[folder] += 1
            disease_counts[label] += 1
            sequence_counts[sequence] += 1
            data = archive.read(info)
            record = {
                "path": path, "source_folder": folder,
                "disease_label": label, "sequence": sequence,
                "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
            }
            try:
                with Image.open(io.BytesIO(data)) as image:
                    image.load()
                    record.update(width=image.width, height=image.height,
                                  mode=image.mode, format=image.format,
                                  exif_field_count=len(image.getexif()))
                    rgb = image.convert("RGB")
                    pixel_bytes = f"{rgb.width}x{rgb.height}:RGB:".encode() + rgb.tobytes()
                    record["pixel_sha256"] = hashlib.sha256(pixel_bytes).hexdigest()
                    gray = rgb.convert("L")
                    small = np.asarray(gray.resize((32, 32), Image.Resampling.LANCZOS), dtype=float)
                    freq = dctn(small, norm="ortho")[:8, :8].ravel()
                    bits = freq > np.median(freq[1:])
                    record["phash"] = f"{int(''.join('1' if x else '0' for x in bits), 2):016x}"
                    record["grayscale_content"] = all(
                        np.array_equal(np.asarray(rgb)[:, :, 0], np.asarray(rgb)[:, :, channel])
                        for channel in (1, 2)
                    )
                    if label in {"Meduloblastoma", "Ependimoma", "Astrocitoma", "_NORMAL"}:
                        key = (label, sequence)
                        if sum(p[0] == key for p in previews) < 2:
                            previews.append((key, path, ImageOps.contain(rgb, (230, 230))))
            except Exception as exc:
                record["decode_error"] = str(exc)
                failures.append({"path": path, "error": str(exc)})
            records.append(record)
            if (index + 1) % 500 == 0:
                print(f"Inspected {index + 1}/{len(files)} images", flush=True)

    exact = duplicate_groups(records, "sha256")
    pixels = duplicate_groups(records, "pixel_sha256")
    readable = [r for r in records if "decode_error" not in r]
    # A low pHash distance is a manual-review lead, not proof of duplication.
    # Collapse exact pixel copies before looking for possible near-duplicates.
    unique_pixels = list({r["pixel_sha256"]: r for r in readable}.values())
    hashes = [int(r["phash"], 16) for r in unique_pixels]
    near_pairs = []
    for i, first in enumerate(unique_pixels):
        for j in range(i + 1, len(unique_pixels)):
            distance = (hashes[i] ^ hashes[j]).bit_count()
            if distance <= 4:
                second = unique_pixels[j]
                near_pairs.append({"first": first["path"], "second": second["path"],
                                   "phash_distance": distance,
                                   "cross_disease": first["disease_label"] != second["disease_label"],
                                   "cross_sequence": first["sequence"] != second["sequence"]})

    notebook_matches = []
    notebook_dir = Path(__file__).resolve().parents[2] / "Medulloblastoma_SIP_Colab" / "MB_10_images"
    source_hashes = defaultdict(list)
    for record in records:
        source_hashes[record["sha256"]].append(record["path"])
    for image in sorted(notebook_dir.glob("*.jpg")):
        notebook_matches.append({"notebook_image": image.name,
                                 "archive_matches": source_hashes[hashlib.sha256(image.read_bytes()).hexdigest()]})

    summary = {
        "archive": str(args.archive.resolve()), "archive_sha256": hashlib.file_digest(args.archive.open("rb"), "sha256").hexdigest(), "file_count": len(records),
        "folder_count": len(folder_counts), "readable_images": len(readable),
        "failures": failures, "folder_counts": dict(sorted(folder_counts.items())),
        "disease_counts": dict(sorted(disease_counts.items())),
        "sequence_counts": dict(sorted(sequence_counts.items())),
        "format_counts": dict(Counter(r["format"] for r in readable)),
        "mode_counts": dict(Counter(r["mode"] for r in readable)),
        "grayscale_content_images": sum(r["grayscale_content"] for r in readable),
        "unique_dimensions": len({(r["width"], r["height"]) for r in readable}),
        "common_dimensions": Counter(f"{r['width']}x{r['height']}" for r in readable).most_common(12),
        "width_range": [min(r["width"] for r in readable), max(r["width"] for r in readable)],
        "height_range": [min(r["height"] for r in readable), max(r["height"] for r in readable)],
        "file_duplicate_groups": exact, "pixel_duplicate_groups": pixels,
        "unique_file_hashes": len({r["sha256"] for r in records}),
        "unique_pixel_hashes": len(unique_pixels),
        "near_duplicate_candidate_pairs": len(near_pairs),
        "near_duplicate_cross_disease_pairs": sum(p["cross_disease"] for p in near_pairs),
        "notebook_matches": notebook_matches,
        "patient_ids": "No patient manifest or verified patient grouping is supplied.",
        "annotations": "No segmentation masks, bounding boxes, or clinical metadata files are supplied.",
        "near_duplicate_method": "64-bit DCT pHash, Hamming distance <= 4, after exact pixel deduplication; candidates require manual review.",
    }
    (args.output / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    (args.output / "manifest.jsonl").write_text("\n".join(json.dumps(r) for r in records) + "\n", encoding="utf-8")
    (args.output / "near_duplicate_candidates.json").write_text(json.dumps(near_pairs, indent=2), encoding="utf-8")

    previews.sort(key=lambda p: (p[0], p[1]))
    columns, tile_width, tile_height = 6, 250, 275
    sheet = Image.new("RGB", (columns * tile_width, ((len(previews) + columns - 1) // columns) * tile_height), "#111827")
    draw = ImageDraw.Draw(sheet)
    for i, (key, path, image) in enumerate(previews):
        x, y = i % columns * tile_width, i // columns * tile_height
        sheet.paste(image, (x + (tile_width - image.width) // 2, y + 30))
        draw.text((x + 8, y + 5), f"{key[0]} / {key[1]}", fill="white")
        draw.text((x + 8, y + 260), Path(path).name[:30], fill="#cbd5e1")
    sheet.save(args.output / "sample_contact_sheet.jpg", quality=93)
    print(json.dumps({k: v for k, v in summary.items() if k not in {
        "file_duplicate_groups", "pixel_duplicate_groups", "folder_counts", "notebook_matches"}}, indent=2), flush=True)


if __name__ == "__main__":
    main()
