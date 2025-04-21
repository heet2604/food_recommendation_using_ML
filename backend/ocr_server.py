from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import os
from flask_cors import CORS
from werkzeug.utils import secure_filename
import gc
from waitress import serve  # Production server

# Configuration
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'}

# Initialize OCR model (consider lazy loading if needed)
ocr = PaddleOCR(
    use_angle_cls=True,
    lang="en",
    use_gpu=False,  # Disable GPU on Render
    enable_mkldnn=True,  # Enable Intel acceleration if available
    rec_batch_num=1,  # Reduce batch size to save memory
    cls_batch_num=1
)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
        # Secure filename and save
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Process with memory cleanup
        results = ocr.ocr(file_path, cls=True)
        extracted_text = "\n".join([line[1][0] for res in results for line in res])

        # Cleanup
        os.remove(file_path)
        gc.collect()  # Force garbage collection

        return jsonify({"text": extracted_text})
    
    except Exception as e:
        app.logger.error(f"OCR processing failed: {str(e)}")
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({"error": "OCR processing failed"}), 500

if __name__ == "__main__":
    # Production server configuration
    serve(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 10000)),
        threads=2,  # Reduce thread count for memory
        channel_timeout=120  # Longer timeout for OCR processing
    )