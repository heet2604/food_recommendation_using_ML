import sys 
from ultralytics import YOLO
from PIL import Image
import io
import base64

model = YOLO("best.pt")

def main():
    image_data = base64.b64decode(sys.stdin.read())
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    results = model.predict(image)
    label = results[0].names[results[0].boxes.cls[0].item()]
    print(label)


if __name__ == "__main__":
    main