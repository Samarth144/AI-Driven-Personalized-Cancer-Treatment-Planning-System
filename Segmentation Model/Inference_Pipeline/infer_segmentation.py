#MRI → tumor_mask.npy

import torch
import numpy as np
import nibabel as nib
from monai.networks.nets import UNet
from monai.transforms import ScaleIntensity
from monai.inferers import sliding_window_inference

# =====================================================
# CONFIG
# =====================================================
MRI_PATH = "../Test_Data/input_mri.nii.gz"
MODEL_PATH = "../Model/brats3d_final_model.pth"

ROI_SIZE = (128, 128, 128)
SW_BATCH_SIZE = 1

# =====================================================
# DEVICE
# =====================================================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# =====================================================
# LOAD MODEL
# =====================================================
model = UNet(
    spatial_dims=3,
    in_channels=1,
    out_channels=2,
    channels=(32, 64, 128, 256),
    strides=(2, 2, 2),
    num_res_units=2,
).to(device)

ckpt = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(ckpt["model_state"])
model.eval()

print("✅ Model loaded")

# =====================================================
# LOAD MRI
# =====================================================
img = nib.load(MRI_PATH)
mri_np = img.get_fdata().astype(np.float32)
print("Raw MRI shape:", mri_np.shape)

mri_np = ScaleIntensity()(mri_np).numpy()
mri_tensor = torch.from_numpy(mri_np).unsqueeze(0).unsqueeze(0).to(device)

# =====================================================
# INFERENCE
# =====================================================
with torch.no_grad():
    logits = sliding_window_inference(
        inputs=mri_tensor,
        roi_size=ROI_SIZE,
        sw_batch_size=SW_BATCH_SIZE,
        predictor=model,
        overlap=0.5,
    )
    tumor_mask = torch.argmax(logits, dim=1)

tumor_mask_np = tumor_mask.cpu().numpy()[0]

np.save("tumor_mask.npy", tumor_mask_np)
print("✅ tumor_mask.npy saved")
