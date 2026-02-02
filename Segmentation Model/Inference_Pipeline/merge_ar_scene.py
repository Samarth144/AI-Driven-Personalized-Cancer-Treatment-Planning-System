#tumor.glb + brain.glb → AR GLB

import trimesh
import numpy as np
from trimesh.visual import ColorVisuals
from trimesh.smoothing import filter_laplacian

# =====================================================
# CONFIG (DYNAMIC & SAFE)
# =====================================================
MIN_VISIBLE_RATIO = 0.05
MAX_ALLOWED_RATIO = 0.35

# =====================================================
# LOAD TUMOR
# =====================================================
tumor_raw = trimesh.load("tumor.glb")

if isinstance(tumor_raw, trimesh.Scene):
    tumor = trimesh.util.concatenate(list(tumor_raw.geometry.values()))
else:
    tumor = tumor_raw

tumor.apply_translation(-tumor.centroid)

# Smooth surface (visual only)
filter_laplacian(tumor, iterations=10)

# Measure tumor size
tumor_bounds = tumor.bounds
tumor_diameter = (tumor_bounds[1] - tumor_bounds[0]).max()

# =====================================================
# LOAD BRAIN (UNCHANGED)
# =====================================================
brain_scene = trimesh.load("../AR_Assets/brain.glb", force="scene")

brain_bounds = np.array([g.bounds for g in brain_scene.geometry.values()])
brain_min = brain_bounds[:, 0, :].min(axis=0)
brain_max = brain_bounds[:, 1, :].max(axis=0)
brain_size = brain_max - brain_min
brain_diameter = brain_size.max()

# =====================================================
# DYNAMIC SCALING
# =====================================================
real_ratio = tumor_diameter / brain_diameter
target_ratio = min(max(real_ratio, MIN_VISIBLE_RATIO), MAX_ALLOWED_RATIO)

scale_factor = (brain_diameter * target_ratio) / tumor_diameter
tumor.apply_scale(scale_factor)

# =====================================================
# POSITION USING MASK CENTROID
# =====================================================
mask = np.load("tumor_mask.npy")
voxels = np.argwhere(mask > 0)
center_voxel = voxels.mean(axis=0)

relative_pos = center_voxel / np.array(mask.shape)
tumor_position = brain_min + relative_pos * brain_size
tumor.apply_translation(tumor_position)

# =====================================================
# VISUAL STYLING
# =====================================================
tumor.visual = ColorVisuals(
    mesh=tumor,
    face_colors=[200, 0, 0, 210]
)

outline = tumor.copy()
outline.apply_scale(1.02)
outline.visual.face_colors = [255, 0, 0, 60]

# =====================================================
# MERGE SCENE
# =====================================================
final_scene = trimesh.Scene()
final_scene.add_geometry(tumor, node_name="tumor")
final_scene.add_geometry(outline, node_name="tumor_outline")

for name, geom in brain_scene.geometry.items():
    final_scene.add_geometry(geom, node_name=f"brain_{name}")

# =====================================================
# ROTATE TO HORIZONTAL
# =====================================================
rotation = trimesh.transformations.rotation_matrix(
    angle=-np.pi / 2,
    direction=[1, 0, 0],
    point=[0, 0, 0]
)
final_scene.apply_transform(rotation)

# =====================================================
# EXPORT
# =====================================================
final_scene.export("tumor_with_brain.glb")
print("[SUCCESS] tumor_with_brain.glb exported")
