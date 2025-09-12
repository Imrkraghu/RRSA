import torch
from torchvision import models, transforms
from PIL import Image

def load_model(model_path="models/roadnet_v3.pth"):
    model = models.mobilenet_v3_large(pretrained=False)
    model.classifier[3] = torch.nn.Linear(1280, 2)
    model.load_state_dict(torch.load(model_path, map_location="cpu"))
    model.eval()
    return model

def preprocess_image(image_path):
    image = Image.open(image_path).convert("RGB")
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
        pred = torch.argmax(output, dim=1).item()
        conf = torch.softmax(output, dim=1)[0][pred].item()
    return {"label": ["not-road", "road"][pred], "confidence": round(conf, 4)}