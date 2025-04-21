from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import os
from flask_cors import CORS
from werkzeug.utils import secure_filename
import gc
from waitress import serve
import re
import requests  # For synchronous API calls to Together AI
import json

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
    medications = re.findall(r'\b[A-Z][a-z]+\b(?:\s+\b[A-Z][a-z]+\b)*', text)
    dosages = re.findall(r'\d+\s*mg|\d+\s*ml|\d+\s*times\s*a\s*day', text)
    
    return {
        'medications': list(set(medications)),
        'dosages': list(set(dosages)),
        'fullText': text
    }

def simplify_medical_text(text):
    """Synchronous function to simplify text using Together AI API"""
    url = "https://api.together.xyz/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {os.getenv('TOGETHER_API_KEY')}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "meta-llama/Llama-3-70b-chat-hf",
        "messages": [{
            "role": "user",
            "content": f"Simplify this medical report into easy-to-understand language:\n\n{text}"
        }],
        "temperature": 0.7,
        "max_tokens": 1000
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content']
    except requests.exceptions.RequestException as e:
        app.logger.error(f"AI API error: {str(e)}")
        return "Could not simplify text"  # Fallback response

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

        # Perform OCR
        results = ocr.ocr(file_path, cls=True)
        extracted_text = "\n".join([line[1][0] for res in results for line in res])
        
        # Process medical data
        medical_data = process_medical_text(extracted_text)
        
        # Simplify text (synchronous call)
        simplified_text = simplify_medical_text(extracted_text)

        os.remove(file_path)
        gc.collect()

        return jsonify({
            "extractedText": extracted_text,
            "medicalData": medical_data,
            "simplifiedText": simplified_text
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