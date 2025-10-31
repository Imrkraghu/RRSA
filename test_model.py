import numpy as np
import tensorflow as tf
import cv2

# Load the TFLite model
interpreter = tf.lite.Interpreter(model_path="/home/admin1/Documents/rohit/RRSA/RoadNetApp/mobile/assets/best_float16.tflite")
interpreter.allocate_tensors()

# Get input and output details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print(f"Input shape: {input_details[0]['shape']}")
print(f"Output shape: {output_details[0]['shape']}")

# Load image with OpenCV
img_path = "/home/admin1/Documents/rohit/RRSA/RoadNetApp/mobile/assets/images/1.png"
original_img = cv2.imread(img_path)
original_height, original_width = original_img.shape[:2]

print(f"Original image size: {original_width}x{original_height}")

# Resize and preprocess for model
img_resized = cv2.resize(original_img, (640, 640))
img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
img_np = img_rgb.astype(np.float32) / 255.0
img_np = np.expand_dims(img_np, axis=0)

# Run inference
interpreter.set_tensor(input_details[0]['index'], img_np)
interpreter.invoke()

# Get output
output_data = interpreter.get_tensor(output_details[0]['index'])
print(f"Raw output shape: {output_data.shape}")

# Process YOLO output
# Expected shape: [1, 234, 8400] -> [batch, features, boxes]
output_data = output_data[0]  # Remove batch: [234, 8400]

# Transpose to [8400, 234] for easier processing
if output_data.shape[0] < output_data.shape[1]:
    output_data = output_data.T  # Now [8400, 234]

print(f"Processing {output_data.shape[0]} boxes")

# YOLO11 format: [x, y, w, h] + class scores
boxes = output_data[:, :4]  # Box coordinates
class_scores = output_data[:, 4:]  # Class probabilities

# Get best class for each detection
class_ids = np.argmax(class_scores, axis=1)
confidences = np.max(class_scores, axis=1)

# Filter by confidence
conf_threshold = 0.25
mask = confidences > conf_threshold
filtered_boxes = boxes[mask]
filtered_confidences = confidences[mask]
filtered_class_ids = class_ids[mask]

print(f"Found {len(filtered_boxes)} detections above threshold {conf_threshold}")

# Convert YOLO format (cx, cy, w, h) to (x1, y1, x2, y2)
def convert_boxes(boxes):
    x_center, y_center, width, height = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    x1 = (x_center - width / 2) * 640
    y1 = (y_center - height / 2) * 640
    x2 = (x_center + width / 2) * 640
    y2 = (y_center + height / 2) * 640
    return np.stack([x1, y1, x2, y2], axis=1)

if len(filtered_boxes) > 0:
    boxes_xyxy = convert_boxes(filtered_boxes)
    
    # Apply Non-Maximum Suppression
    indices = cv2.dnn.NMSBoxes(
        boxes_xyxy.tolist(),
        filtered_confidences.tolist(),
        score_threshold=conf_threshold,
        nms_threshold=0.45
    )
    
    # Prepare visualization
    result_img = original_img.copy()
    scale_x = original_width / 640
    scale_y = original_height / 640
    
    # Define your class names (update with your actual classes)
    # class_names = [f"Class_{i}" for i in range(class_scores.shape[1])]
    # Example: class_names = ["person", "car", "bike", "traffic_light", ...]
    import yaml

    # --- Load class names from YAML file ---
    yaml_path = "apk-test/dataset5.yaml"  # <-- change path if needed
    try:
        with open(yaml_path, 'r') as f:
            data = yaml.safe_load(f)
            if "names" in data:
                class_names = data["names"]
                print(f"\n✅ Loaded {len(class_names)} class names from {yaml_path}")
            else:
                print("⚠️ 'names' key not found in YAML — using generic labels")
                class_names = [f"Class_{i}" for i in range(output_details[0]['shape'][-1])]
    except Exception as e:
        print(f"⚠️ Could not load YAML file: {e}")
        class_names = [f"Class_{i}" for i in range(output_details[0]['shape'][-1])]

    
    # Generate colors
    np.random.seed(42)
    colors = np.random.randint(0, 255, size=(len(class_names), 3), dtype=np.uint8)
    
    # Draw detections
    if len(indices) > 0:
        print(f"\nDetections after NMS: {len(indices)}")
        for idx in indices.flatten():
            box = boxes_xyxy[idx]
            conf = filtered_confidences[idx]
            class_id = filtered_class_ids[idx]
            
            # Scale to original image
            x1 = int(box[0] * scale_x)
            y1 = int(box[1] * scale_y)
            x2 = int(box[2] * scale_x)
            y2 = int(box[3] * scale_y)
            
            # Get color
            color = [int(c) for c in colors[class_id]]
            
            # Draw box
            cv2.rectangle(result_img, (x1, y1), (x2, y2), color, 2)
            
            # Prepare label
            label = f"{class_names[class_id]}: {conf:.2f}"
            print(f"  {label} at [{x1}, {y1}, {x2}, {y2}]")
            
            # Draw label background
            (text_width, text_height), baseline = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
            )
            cv2.rectangle(
                result_img,
                (x1, y1 - text_height - 10),
                (x1 + text_width, y1),
                color,
                -1
            )
            
            # Draw label text
            cv2.putText(
                result_img,
                label,
                (x1, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2
            )
        
        # Save result
        output_path = "detection_result.jpg"
        cv2.imwrite(output_path, result_img)
        print(f"\n✅ Result saved to: {output_path}")
        
        # Display result
        cv2.imshow("YOLO Detection Results", result_img)
        print("\nPress any key to close the window...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    else:
        print("No detections after NMS")
else:
    print("No detections found!")