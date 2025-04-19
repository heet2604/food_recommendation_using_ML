from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

app = Flask(__name__)

# Enhanced CORS configuration
from flask_cors import CORS
CORS(app, resources={
    r"/ocr": {
        "origins": [
            "https://food-recommendation-using-ml.vercel.app",  # Your Vercel frontend
            "https://food-recommendation-using-ml.onrender.com"  # Your Node backend
        ],
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

ocr = PaddleOCR(use_angle_cls=True, lang="en")

@app.route("/ocr", methods=["POST"])
def process_image():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Process in memory without saving to disk
        img_bytes = file.read()
        results = ocr.ocr(img_bytes, cls=True)
        
        extracted_text = "\n".join(
            line[1][0] for res in results for line in res if len(line) > 1
        ) if results else ""
        
        return jsonify({
            "text": extracted_text,
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({
            "error": "OCR processing failed",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, threaded=True)