from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import os
from flask_cors import CORS
from werkzeug.utils import secure_filename
import gc
from waitress import serve
import re  # For medical text processing

# Configuration
app = Flask(__name__)
CORS(app, resources={
    r"/ocr": {"origins": "*"},
    r"/api/*": {"origins": "*"}
})
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'}

# Initialize OCR model
ocr = PaddleOCR(
    use_angle_cls=True,
    lang="en",
    use_gpu=False,
    enable_mkldnn=True,
    rec_batch_num=1,
    cls_batch_num=1
)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_medical_text(text):
    """Helper function to extract medical-specific information"""
    # Example: Extract medication names (simple regex pattern)
    medications = re.findall(r'\b[A-Z][a-z]+\b(?:\s+\b[A-Z][a-z]+\b)*', text)
    # Extract potential dosages
    dosages = re.findall(r'\d+\s*mg|\d+\s*ml|\d+\s*times\s*a\s*day', text)
    
    return {
        'medications': list(set(medications)),  # Remove duplicates
        'dosages': list(set(dosages)),
        'fullText': text
    }

@app.route("/ocr", methods=["POST"])
def process_image():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    try:
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        results = ocr.ocr(file_path, cls=True)
        extracted_text = "\n".join([line[1][0] for res in results for line in res])

        os.remove(file_path)
        gc.collect()

        return jsonify({"text": extracted_text})
    
    except Exception as e:
        app.logger.error(f"OCR processing failed: {str(e)}")
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({"error": f"OCR processing failed: {str(e)}"}), 500

@app.route("/api/medical", methods=["POST"])
def process_medical():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    try:
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        results = ocr.ocr(file_path, cls=True)
        extracted_text = "\n".join([line[1][0] for res in results for line in res])
        medical_data = process_medical_text(extracted_text)

        os.remove(file_path)
        gc.collect()

        return jsonify({
            "extractedText": extracted_text,
            "medicalData": medical_data
        })
    
    except Exception as e:
        app.logger.error(f"Medical processing failed: {str(e)}")
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({"error": f"Medical processing failed: {str(e)}"}), 500

if __name__ == "__main__":
    serve(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5001)),
        threads=2,
        channel_timeout=120
    )