import numpy as np
import trimesh
from skimage.measure import marching_cubes
import os

# =====================================================
# LOAD PROBABILITY MAP
# =====================================================
# We use the probability map to get precise regions
probs_path = "tumor_probs.npy"
if not os.path.exists(probs_path):
    print(f"[ERROR] Probability map not found at {os.path.abspath(probs_path)}")
    exit(1)

probs = np.load(probs_path)
print("Probs shape:", probs.shape)

# =====================================================
# EXTRACT TUMOR CORE (High Confidence > 0.8)
# =====================================================
try:
    if np.max(probs) > 0.8:
        verts, faces, _, _ = marching_cubes(probs, level=0.8)
        tumor_mesh = trimesh.Trimesh(vertices=verts, faces=faces)
        tumor_mesh.export("tumor.glb")
        print("[SUCCESS] tumor.glb (core) exported")
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
        edema_mesh.export("edema.glb")
        print("[SUCCESS] edema.glb exported")
    else:
        print("[WARNING] No edema region detected")
except Exception as e:
    print(f"[ERROR] Edema extraction failed: {e}")