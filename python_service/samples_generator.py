"""
MedulloSight — Synthetic Benchmark MRI Generator
Generates anatomically plausible 2D axial brain MRI slices simulating
medulloblastoma in the posterior fossa strictly for educational
demonstration, automated testing, and zero-setup exploration.
"""

import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter


def generate_benchmark_slices(output_dir: str) -> None:
    """Generates synthetic T1, T1c, and T2 benchmark MRI slices."""
    os.makedirs(output_dir, exist_ok=True)
    h, w = 384, 384
    y, x = np.ogrid[:h, :w]
    cy, cx = h // 2, w // 2

    # 1. Base Elliptical Skull and Scalp
    outer_skull = ((y - cy) / 160.0) ** 2 + ((x - cx) / 135.0) ** 2 <= 1.0
    inner_skull = ((y - cy) / 148.0) ** 2 + ((x - cx) / 125.0) ** 2 <= 1.0
    brain_parenchyma = ((y - cy) / 140.0) ** 2 + ((x - cx) / 118.0) ** 2 <= 1.0

    # Ventricles (anterior horns and 4th ventricle in posterior fossa)
    lat_ventricle_l = (
        ((y - (cy - 20)) / 30.0) ** 2 + ((x - (cx - 18)) / 8.0) ** 2 <= 1.0
    )
    lat_ventricle_r = (
        ((y - (cy - 20)) / 30.0) ** 2 + ((x - (cx + 18)) / 8.0) ** 2 <= 1.0
    )
    fourth_ventricle = (
        ((y - (cy + 75)) / 12.0) ** 2 + ((x - cx) / 10.0) ** 2 <= 1.0
    )

    # Posterior Fossa Region (lower central/cerebellar area)
    posterior_fossa = (
        ((y - (cy + 70)) / 45.0) ** 2 + ((x - cx) / 55.0) ** 2 <= 1.0
    )
    cerebellum = brain_parenchyma & posterior_fossa

    # Medulloblastoma lesion in posterior fossa / 4th ventricle vicinity
    tumor_region = (
        ((y - (cy + 72)) / 22.0) ** 2 + ((x - (cx + 4)) / 20.0) ** 2 <= 1.0
    )

    # Add realistic smooth parenchymal gradient and sulcal texture
    rng = np.random.default_rng(101)
    noise_texture = rng.normal(0, 4, (h, w))

    # --- T1 Slice Generation ---
    # Scalp fat is bright (200), CSF is dark (25), white matter (140)
    # Medulloblastoma is hypointense / slightly darker (75)
    t1 = np.zeros((h, w), dtype=np.float64)
    t1[outer_skull & ~inner_skull] = 195  # Subcutaneous bright scalp fat
    t1[inner_skull & ~brain_parenchyma] = 40  # Cranial bone (dark)
    t1[brain_parenchyma] = 130 + noise_texture[brain_parenchyma]
    t1[cerebellum] = 118 + noise_texture[cerebellum]
    t1[lat_ventricle_l | lat_ventricle_r | fourth_ventricle] = 25
    t1[tumor_region] = 72 + noise_texture[tumor_region]  # Hypointense lesion
    t1 = np.clip(gaussian_filter(t1, sigma=0.8), 0, 255).astype(np.uint8)

    # --- T1C+ (Contrast-Enhanced) Slice Generation ---
    # Solid tumor enhances intensely (bright 220), vascular structures enhance
    t1c = t1.copy().astype(np.float64)
    t1c[tumor_region] = 225 + noise_texture[tumor_region]
    t1c = np.clip(gaussian_filter(t1c, sigma=0.6), 0, 255).astype(np.uint8)

    # --- T2 Slice Generation ---
    # CSF bright (230), brain medium (90-110), tumor hyperintense (185)
    t2 = np.zeros((h, w), dtype=np.float64)
    t2[outer_skull & ~inner_skull] = 70  # Subcutaneous fat low on T2
    t2[inner_skull & ~brain_parenchyma] = 30  # Skull
    t2[brain_parenchyma] = 95 + noise_texture[brain_parenchyma]
    t2[cerebellum] = 105 + noise_texture[cerebellum]
    t2[lat_ventricle_l | lat_ventricle_r | fourth_ventricle] = 230
    t2_noise = rng.normal(0, 10, (h, w))
    t2[tumor_region] = 188 + t2_noise[tumor_region]
    t2 = np.clip(gaussian_filter(t2, sigma=0.8), 0, 255).astype(np.uint8)

    # Save PNG files using PIL
    Image.fromarray(t1).save(os.path.join(output_dir, "t1_medullo.png"))
    Image.fromarray(t1c).save(os.path.join(output_dir, "t1c_medullo.png"))
    Image.fromarray(t2).save(os.path.join(output_dir, "t2_medullo.png"))
    print("Benchmark slices generated successfully in:", output_dir)


if __name__ == "__main__":
    target_dir = os.path.join(os.path.dirname(__file__), "samples")
    generate_benchmark_slices(target_dir)
