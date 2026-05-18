import numpy as np
import trimesh
from skimage.measure import marching_cubes
import os
import argparse

# =====================================================
# CONFIG & ARGS
# =====================================================
parser = argparse.ArgumentParser()
parser.add_argument("--data_dir", type=str, default=".", help="Directory containing the .npy files and where to save .glb")
args = parser.parse_args()

data_dir = args.data_dir

# =====================================================
# LOAD PROBABILITY MAP
# =====================================================
probs_path = os.path.join(data_dir, "tumor_probs.npy")
if not os.path.exists(probs_path):
    print(f"[ERROR] Probability map not found at {os.path.abspath(probs_path)}")
    exit(1)

probs = np.load(probs_path)
# Downsample by 2x to speed up marching cubes (8x less volume to process)
probs = probs[::2, ::2, ::2]
print("Downsampled Probs shape:", probs.shape)

# =====================================================
# EXTRACT TUMOR CORE (High Confidence > 0.8)
# =====================================================
try:
    if np.max(probs) > 0.8:
        verts, faces, _, _ = marching_cubes(probs, level=0.8)
        tumor_mesh = trimesh.Trimesh(vertices=verts, faces=faces)
        # Decimate: marching cubes on 240^3 data can produce 100k+ faces — reduce to ~5k
        target_faces = min(5000, len(tumor_mesh.faces))
        tumor_mesh = tumor_mesh.simplify_quadric_decimation(target_faces)
        output_path = os.path.join(data_dir, "tumor.glb")
        tumor_mesh.export(output_path)
        print(f"[SUCCESS] {output_path} (core) exported — {len(tumor_mesh.faces)} faces")
    else:
        print("[WARNING] No high-confidence core detected")
except Exception as e:
    print(f"[ERROR] Core extraction failed: {e}")

# =====================================================
# EXTRACT EDEMA REGION (Low Confidence > 0.2)
# =====================================================
try:
    if np.max(probs) > 0.2:
        verts, faces, _, _ = marching_cubes(probs, level=0.2)
        edema_mesh = trimesh.Trimesh(vertices=verts, faces=faces)
        # Decimate: edema at 0.2 threshold covers most of the volume — reduce aggressively
        target_faces = min(8000, len(edema_mesh.faces))
        edema_mesh = edema_mesh.simplify_quadric_decimation(target_faces)
        output_path = os.path.join(data_dir, "edema.glb")
        edema_mesh.export(output_path)
        print(f"[SUCCESS] {output_path} exported — {len(edema_mesh.faces)} faces")
    else:
        print("[WARNING] No edema region detected")
except Exception as e:
    print(f"[ERROR] Edema extraction failed: {e}")