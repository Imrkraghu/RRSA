import torch, os
from torchvision import datasets, transforms, models
import torch.nn as nn
from torch.utils.data import DataLoader

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
train_data = datasets.ImageFolder("/home/hanuai/Documents/reactnative/rrsa/RRSA/backend/dataset", transform=transform)
train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)

# Model
model = models.mobilenet_v3_large(pretrained=True)
model.classifier[3] = nn.Linear(1280, 2)
model.to(DEVICE)

# Training
optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
loss_fn = nn.CrossEntropyLoss()

for epoch in range(EPOCHS):
    model.train()
    for images, labels in train_loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        outputs = model(images)
        loss = loss_fn(outputs, labels)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch+1}/{EPOCHS} complete")

# Save
os.makedirs("models", exist_ok=True)
torch.save(model.state_dict(), "models/roadnet_v3.pth")