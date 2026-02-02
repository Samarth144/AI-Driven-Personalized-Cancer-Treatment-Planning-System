#tumor_mask.npy → tumor.glb

import numpy as np
import trimesh
from skimage.measure import marching_cubes

# =====================================================
# LOAD MASK
# =====================================================
mask = np.load("tumor_mask.npy")
print("Mask shape:", mask.shape)

# =====================================================
# EXTRACT SURFACE
# =====================================================
verts, faces, _, _ = marching_cubes(mask, level=0.5)

tumor_mesh = trimesh.Trimesh(vertices=verts, faces=faces)
tumor_mesh.export("tumor.glb")

print("[SUCCESS] tumor.glb exported")
