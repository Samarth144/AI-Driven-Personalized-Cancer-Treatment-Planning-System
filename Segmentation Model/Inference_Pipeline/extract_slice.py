import sys
import numpy as np
import nibabel as nib
from PIL import Image
import base64
import io
import matplotlib.pyplot as plt
import os

def normalize_slice(slice_data):
    """Normalize slice to 0-255 range."""
    if np.max(slice_data) == np.min(slice_data):
        return np.zeros_like(slice_data, dtype=np.uint8)
    slice_data = (slice_data - np.min(slice_data)) / (np.max(slice_data) - np.min(slice_data))
    return (slice_data * 255).astype(np.uint8)

def apply_heatmap(slice_data):
    """Apply a heatmap colormap to the slice."""
    cm = plt.get_cmap('jet')
    colored_slice = cm(slice_data)
    return (colored_slice * 255).astype(np.uint8)

def get_base64_image(image_array, mode='L'):
    """Convert numpy array to base64 string."""
    if mode == 'RGBA':
        img = Image.fromarray(image_array, 'RGBA')
    else:
        img = Image.fromarray(image_array, 'L')
        
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python extract_slice.py <file_path> <file_type> <slice_index> <view_type> <view_plane>")
        sys.exit(1)

    file_path = sys.argv[1]
    file_type = sys.argv[2] # 'nii' or 'npy'
    slice_index = int(sys.argv[3])
    view_type = sys.argv[4] if len(sys.argv) > 4 else 'source' # 'source', 'mask', 'heatmap'
    view_plane = sys.argv[5] if len(sys.argv) > 5 else 'axial' # 'axial', 'sagittal', 'coronal'

    try:
        # Load Data
        if file_type == 'nii':
            img = nib.load(file_path)
            data = img.get_fdata()
        elif file_type == 'npy':
            # Check if path exists, if not try relative to script
            if not os.path.exists(file_path):
                # fallback for manual cli runs
                script_dir = os.path.dirname(os.path.abspath(__file__))
                file_path = os.path.join(script_dir, file_path)
            data = np.load(file_path)
        else:
            raise ValueError("Unsupported file type")

        # Extract Slice based on Plane
        # Shape: (H, W, D) -> (240, 240, 155)
        if view_plane == 'sagittal':
            # Slice along X axis
            slice_index = min(slice_index, data.shape[0] - 1)
            slice_data = np.rot90(data[slice_index, :, :])
        elif view_plane == 'coronal':
            # Slice along Y axis
            slice_index = min(slice_index, data.shape[1] - 1)
            slice_data = np.rot90(data[:, slice_index, :])
        else: # axial
            # Slice along Z axis
            slice_index = min(slice_index, data.shape[2] - 1)
            slice_data = np.rot90(data[:, :, slice_index])

        # Process based on view type
        if view_type == 'source':
            norm_slice = normalize_slice(slice_data)
            b64_str = get_base64_image(norm_slice)
            
        elif view_type == 'mask':
            h, w = slice_data.shape
            rgba_image = np.zeros((h, w, 4), dtype=np.uint8)
            mask_indices = slice_data > 0
            rgba_image[mask_indices] = [0, 240, 255, 150] # Cyan
            b64_str = get_base64_image(rgba_image, 'RGBA')

        elif view_type == 'heatmap':
            rgba_image = apply_heatmap(slice_data) 
            alpha_channel = (slice_data * 200).astype(np.uint8)
            alpha_channel[slice_data < 0.1] = 0
            rgba_image[:, :, 3] = alpha_channel
            b64_str = get_base64_image(rgba_image, 'RGBA')

        print(b64_str)

    except Exception as e:
        sys.exit(1)