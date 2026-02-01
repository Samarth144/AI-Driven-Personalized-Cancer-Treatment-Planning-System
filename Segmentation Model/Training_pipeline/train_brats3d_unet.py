"""
Brain Tumor 3D Segmentation using MONAI + BraTS 2020
Author: <Your Name>
Model: 3D UNet
Task: Binary Tumor Segmentation (Tumor vs Background)
Dataset: MICCAI BraTS 2020 (FLAIR modality)
"""

# ===============================
# 1. Imports
# ===============================
import os
import glob
import random
import torch
from torch.optim import Adam
from tqdm import tqdm

from monai.networks.nets import UNet
from monai.losses import DiceCELoss
from monai.data import Dataset, DataLoader
from monai.inferers import sliding_window_inference
from monai.transforms import (
    LoadImaged,
    EnsureChannelFirstd,
    Spacingd,
    Orientationd,
    ScaleIntensityRanged,
    CropForegroundd,
    RandSpatialCropd,
    ToTensord,
    Compose,
    LambdaD,
)

# ===============================
# 2. Configuration
# ===============================
DATA_ROOT = "/kaggle/input/brats20-dataset-training-validation/BraTS2020_TrainingData/MICCAI_BraTS2020_TrainingData"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

EPOCHS = 50
BATCH_SIZE = 1
LR = 1e-4
ROI_SIZE = (128, 128, 128)

# ===============================
# 3. Collect Dataset Paths
# ===============================
cases = sorted([os.path.join(DATA_ROOT, d) for d in os.listdir(DATA_ROOT)])
data = []

for c in cases:
    flair = glob.glob(os.path.join(c, "*flair*.nii*"))
    seg = glob.glob(os.path.join(c, "*seg*.nii*"))
    if flair and seg:
        data.append({"image": flair[0], "label": seg[0]})

print(f"Total usable cases: {len(data)}")

# Train / Validation split
random.seed(42)
random.shuffle(data)
split_idx = int(0.8 * len(data))
train_files = data[:split_idx]
val_files = data[split_idx:]

# ===============================
# 4. Transforms
# ===============================
# Convert multi-class BraTS labels → binary tumor mask
binary_label = LambdaD(keys="label", func=lambda x: (x > 0).float())

train_transforms = Compose([
    LoadImaged(keys=["image", "label"]),
    EnsureChannelFirstd(keys=["image", "label"]),
    Spacingd(keys=["image", "label"], pixdim=(1, 1, 1),
             mode=("bilinear", "nearest")),
    Orientationd(keys=["image", "label"], axcodes="RAS"),
    ScaleIntensityRanged(
        keys=["image"],
        a_min=-100,
        a_max=400,
        b_min=0.0,
        b_max=1.0,
        clip=True,
    ),
    CropForegroundd(keys=["image", "label"], source_key="image"),
    RandSpatialCropd(
        keys=["image", "label"],
        roi_size=ROI_SIZE,
        random_size=False,
    ),
    binary_label,
    ToTensord(keys=["image", "label"]),
])

# ===============================
# 5. DataLoaders
# ===============================
train_ds = Dataset(data=train_files, transform=train_transforms)
val_ds = Dataset(data=val_files, transform=train_transforms)

train_loader = DataLoader(
    train_ds, batch_size=BATCH_SIZE,
    shuffle=True, num_workers=0
)

val_loader = DataLoader(
    val_ds, batch_size=BATCH_SIZE,
    shuffle=False, num_workers=0
)

# ===============================
# 6. Model
# ===============================
model = UNet(
    spatial_dims=3,
    in_channels=1,
    out_channels=2,  # background + tumor
    channels=(32, 64, 128, 256),
    strides=(2, 2, 2),
    num_res_units=2,
).to(DEVICE)

# ===============================
# 7. Loss & Optimizer
# ===============================
loss_fn = DiceCELoss(
    to_onehot_y=True,
    softmax=True
)

optimizer = Adam(model.parameters(), lr=LR)

# ===============================
# 8. Dice Metric Function
# ===============================
def dice_score(pred, target, eps=1e-6):
    intersection = (pred * target).sum()
    union = pred.sum() + target.sum()
    return (2. * intersection + eps) / (union + eps)

# ===============================
# 9. Training Loop
# ===============================
best_dice = 0.0

for epoch in range(1, EPOCHS + 1):

    # ---- Training ----
    model.train()
    train_loss = 0.0

    for batch in tqdm(train_loader, desc=f"Epoch {epoch}/{EPOCHS} [TRAIN]"):
        images = batch["image"].to(DEVICE)
        labels = batch["label"].to(DEVICE)

        optimizer.zero_grad()
        outputs = model(images)
        loss = loss_fn(outputs, labels)
        loss.backward()
        optimizer.step()

        train_loss += loss.item()

    train_loss /= len(train_loader)

    # ---- Validation ----
    model.eval()
    dice_total, count = 0.0, 0

    with torch.no_grad():
        for batch in tqdm(val_loader, desc=f"Epoch {epoch}/{EPOCHS} [VAL]"):
            images = batch["image"].to(DEVICE)
            labels = batch["label"].to(DEVICE)

            outputs = sliding_window_inference(
                images,
                ROI_SIZE,
                sw_batch_size=1,
                predictor=model,
                overlap=0.5
            )

            probs = torch.softmax(outputs, dim=1)[:, 1:2]
            preds = (probs > 0.5).float()

            dice_total += dice_score(preds, labels).item()
            count += 1

    val_dice = dice_total / count

    print(
        f"Epoch {epoch} | "
        f"Train Loss: {train_loss:.4f} | "
        f"Val Dice: {val_dice:.4f}"
    )

    # ---- Save Checkpoint ----
    torch.save({
        "epoch": epoch,
        "model_state": model.state_dict(),
        "optimizer_state": optimizer.state_dict(),
        "val_dice": val_dice,
    }, f"brats3d_epoch{epoch}.pth")

    print(f"💾 Saved brats3d_epoch{epoch}.pth")

print("✅ Training complete")
