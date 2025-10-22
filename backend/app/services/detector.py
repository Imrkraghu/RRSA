import torch
from torchvision import models, transforms
from torchvision.models import MobileNet_V3_Large_Weights
from PIL import Image

CLASS_NAMES = {0: "not-road", 1: "road"}

def load_model(model_path="/home/admin1/Documents/rohit/RRSA/backend/app/train/models/roadnet_v3.pth"):
    model = models.mobilenet_v3_large(weights=None)
    model.classifier[3] = torch.nn.Linear(1280, 2)
    model.load_state_dict(torch.load(model_path, map_location="cpu"))
    model.eval()
    return model

def preprocess_image(image_path):
    try:
        image = Image.open(image_path).convert("RGB")
    except Exception as e:
        raise ValueError(f"❌ Failed to load image: {e}")

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])
    return transform(image).unsqueeze(0)

def detect_road(image_path):
    model = load_model()
    input_tensor = preprocess_image(image_path)

    with torch.no_grad():
        output = model(input_tensor)
        probs = torch.softmax(output, dim=1)[0]
        pred = torch.argmax(probs).item()

    return {
        "label": CLASS_NAMES[pred],
        "confidence": round(probs[pred].item(), 4),
        "probabilities": {
            CLASS_NAMES[i]: round(probs[i].item(), 4) for i in range(len(probs))
        }
    }
