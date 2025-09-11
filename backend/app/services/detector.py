import torch
from torchvision import models, transforms
from PIL import Image
import os

# Load MobileNetV3 model (binary classifier: road / not-road)
def load_model(model_path: str = "models/roadnet_v3.pth") -> torch.nn.Module:
    model = models.mobilenet_v3_large(pretrained=False)
    model.classifier[3] = torch.nn.Linear(in_features=1280, out_features=2)
    model.load_state_dict(torch.load(model_path, map_location=torch.device("cpu")))
    model.eval()
    return model

# Preprocess image for MobileNetV3
def preprocess_image(image_path: str) -> torch.Tensor:
    image = Image.open(image_path).convert("RGB")
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    return transform(image).unsqueeze(0)

# Run inference and return label + confidence
def detect_road(image_path: str, model: torch.nn.Module = None) -> dict:
    if not os.path.exists(image_path):
        return {"error": "Image path does not exist"}

    if model is None:
        model = load_model()

    input_tensor = preprocess_image(image_path)

    with torch.no_grad():
        output = model(input_tensor)
        prediction = torch.argmax(output, dim=1).item()
        confidence = torch.softmax(output, dim=1)[0][prediction].item()

    label_map = {0: "not-road", 1: "road"}
    return {
        "label": label_map[prediction],
        "confidence": round(confidence, 4),
        "path": image_path
    }
