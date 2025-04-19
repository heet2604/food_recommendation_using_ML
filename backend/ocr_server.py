from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"


app = Flask(__name__)

# Enable CORS if calling from another server
from flask_cors import CORS
CORS(app, resources={r"/ocr": {"origins": "*"}})

ocr = PaddleOCR(use_angle_cls=True, lang="en")  # English OCR Model

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Create upload directory if not exists

@app.route("/ocr", methods=["POST"])
def process_image():
    if "file" not in request.files:
        print("🚨 No file found in request")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
    try:
        file.save(file_path)  # Save uploaded file
        print(f"🔍 Processing file: {file_path}")

        # Perform OCR
        results = ocr.ocr(file_path, cls=True)

        # Extract text from results
        extracted_text = "\n".join([line[1][0] for res in results for line in res])

        os.remove(file_path)  # Clean up file

        print(f"✅ OCR extraction successful. Extracted Text: {extracted_text[:100]}...")  # Show first 100 chars
        return jsonify({"text": extracted_text})
    
    except Exception as e:
        print(f"❌ OCR processing failed: {e}")
        return jsonify({"error": "OCR processing failed"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
