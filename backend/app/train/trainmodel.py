import torch, os
from torchvision import datasets, transforms, models
from torchvision.models import MobileNet_V3_Large_Weights
import torch.nn as nn
from torch.utils.data import DataLoader
from tqdm import tqdm

# Config
BATCH_SIZE = 32
EPOCHS = 10
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Data
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])
train_data = datasets.ImageFolder(
    "/home/hanuai/Documents/reactnative/rrsa/RRSA/backend/dataset",
    transform=transform
)
train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)

# Model
weights = MobileNet_V3_Large_Weights.IMAGENET1K_V1
model = models.mobilenet_v3_large(weights=weights)
model.classifier[3] = nn.Linear(1280, 2)
model.to(DEVICE)

# Training
optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
loss_fn = nn.CrossEntropyLoss()

print(f"📊 Starting training on {len(train_data)} images for {EPOCHS} epochs...\n")

for epoch in range(EPOCHS):
    model.train()
    running_loss = 0.0
    progress = tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS}", unit="batch")

    for images, labels in progress:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        outputs = model(images)
        loss = loss_fn(outputs, labels)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        running_loss += loss.item()
        progress.set_postfix(loss=loss.item())

    avg_loss = running_loss / len(train_loader)
    print(f"✅ Epoch {epoch+1} complete | Avg Loss: {avg_loss:.4f}\n")

# Save
os.makedirs("models", exist_ok=True)
torch.save(model.state_dict(), "models/roadnet_v4.pth")
print("📦 Model saved to models/roadnet_v4.pth")