import numpy as np
from PIL import Image, ImageDraw
import tflite_runtime.interpreter as tflite
import base64
import io
import json
import sys

LABELS_PATH = "labels.txt"
MODEL_PATH = "roadnet_v4.tflite"

def load_labels(path):
    with open(path, "r") as f:
        return [line.strip() for line in f if line.strip()]

def preprocess_image(image_path, size=(640, 640)):
    image = Image.open(image_path).convert("RGB").resize(size)
    np_image = np.array(image).astype(np.float32) / 255.0
    return np.expand_dims(np_image, axis=0), image

def run_inference(image_path):
    labels = load_labels(LABELS_PATH)
    road_index = labels.index("Road")
    interpreter = tflite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()

    input_tensor, original_image = preprocess_image(image_path)
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    interpreter.set_tensor(input_details[0]['index'], input_tensor)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]['index'])[0]  # shape: [234, 8400]

    detections = []
    for i in range(8400):
        offset = i * 234
        x, y, w, h = output[offset], output[offset+1], output[offset+2], output[offset+3]
        obj = output[offset+4]
        scores = output[offset+5:offset+5+len(labels)]
        class_id = np.argmax(scores)
        confidence = obj * scores[class_id]

        if confidence < 0.5:
            continue

        detections.append({
            "label": labels[class_id],
            "confidence": confidence,
            "box": [x, y, w, h],
            "raw": [x, y, w, h, obj, scores[class_id]]
        })

    # Apply NMS (simple IoU-based filtering)
    def iou(boxA, boxB):
        xa, ya, wa, ha = boxA
        xb, yb, wb, hb = boxB
        xa1, ya1 = xa - wa/2, ya - ha/2
        xa2, ya2 = xa + wa/2, ya + ha/2
        xb1, yb1 = xb - wb/2, yb - hb/2
        xb2, yb2 = xb + wb/2, yb + hb/2

        interX1 = max(xa1, xb1)
        interY1 = max(ya1, yb1)
        interX2 = min(xa2, xb2)
        interY2 = min(ya2, yb2)

        interArea = max(0, interX2 - interX1) * max(0, interY2 - interY1)
        boxAArea = (xa2 - xa1) * (ya2 - ya1)
        boxBArea = (xb2 - xb1) * (yb2 - yb1)
        return interArea / (boxAArea + boxBArea - interArea)

    filtered = []
    for det in sorted(detections, key=lambda d: d["confidence"], reverse=True):
        if all(iou(det["box"], f["box"]) < 0.5 for f in filtered):
            filtered.append(det)

    draw = ImageDraw.Draw(original_image)
    road_detection = None
    anomalies = []

    for det in filtered:
        x, y, w, h = det["box"]
        left = int((x - w/2) * original_image.width)
        top = int((y - h/2) * original_image.height)
        right = int((x + w/2) * original_image.width)
        bottom = int((y + h/2) * original_image.height)
        label = det["label"]
        confidence = det["confidence"]
        color = "green" if label == "Road" else "red"
        draw.rectangle([left, top, right, bottom], outline=color, width=2)
        draw.text((left, top), f"{label} {confidence:.2f}", fill=color)

        if label == "Road" and confidence >= 0.7:
            road_detection = {
                "label": label,
                "confidence": confidence,
                "box": det["box"]
            }
        elif label != "Road":
            anomalies.append({
                "label": label,
                "confidence": confidence,
                "box": det["box"]
            })

    buffered = io.BytesIO()
    original_image.save(buffered, format="PNG")
    encoded_image = base64.b64encode(buffered.getvalue()).decode("utf-8")

    result = {
        "roadDetection": road_detection,
        "anomalies": anomalies,
        "success": road_detection is not None,
        "annotatedImage": encoded_image
    }

    print(json.dumps(result))

if __name__ == "__main__":
    image_path = sys.argv[1]
    run_inference(image_path)