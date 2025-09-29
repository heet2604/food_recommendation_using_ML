import sys 
from ultralytics import YOLO
from PIL import Image
import io
import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS

print("🚀 Starting Nourish API Server...")

# Initialize models with correct paths
try:
    food_model = YOLO("./best.pt")
    print("✅ Food detection model loaded")
except Exception as e:
    print(f"❌ Failed to load food model: {e}")
    food_model = None

try:
    coin_model = YOLO("./best(2-rs-coin).pt")
    print("✅ Coin detection model loaded")
except Exception as e:
    print(f"❌ Failed to load coin model: {e}")
    coin_model = None

# Skip OCR initialization for now
OCR_AVAILABLE = False
print("⚠️ OCR disabled for faster startup")

def main():
    image_data = base64.b64decode(sys.stdin.read())
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    results = food_model.predict(image)
    label = results[0].names[results[0].boxes.cls[0].item()]
    print(label)

if __name__ == "__main__":
    main()

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
yolo_model = food_model  # Using the same food model

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # Allow up to 10MB

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Known values for quantity estimation
COIN_DIAMETER_CM = 2.7  # real 2 Rs coin diameter in cm

# Approx food densities (g/cm³)
FOOD_DENSITIES = {
    "poha": 0.80, "rice": 0.75, "roti": 0.45, "dal": 0.95, "sabzi": 0.65,
    "egg": 0.6, "aloo sabji": 0.59, "bhakri": 0.7, "chole": 0.85, 
    "bhindi": 0.62, "coconut chutney": 0.37, "khandvi": 1.0, "medu vada": 0.89,
    "omlette": 0.95, "yogurt": 1.031, "dhokla": 0.17, "pulao": 0.68, 
    "thepla": 0.71, "sambhar": 0.88, "salad": 0.21, "rajma": 1.05,
    "idli": 0.85, "dosa": 0.35, "vada": 0.89, "puri": 0.45, "paratha": 0.55
}

# Food thickness assumptions (in cm)
FOOD_THICKNESS = {
    "roti": 0.3, "poha": 0.8, "rice": 1.5, "dal": 1.2, "sabzi": 1.0,
    "egg": 1.0, "aloo sabji": 1.0, "bhakri": 0.4, "chole": 1.2,
    "bhindi": 0.8, "coconut chutney": 0.5, "khandvi": 0.5, "medu vada": 1.0,
    "omlette": 0.5, "yogurt": 1.0, "dhokla": 1.0, "pulao": 1.2,
    "thepla": 0.3, "sambhar": 1.0, "salad": 2.0, "rajma": 1.2,
    "idli": 1.0, "dosa": 0.2, "vada": 1.0, "puri": 0.8, "paratha": 0.4
}

# ---------- Quantity Estimation Functions ----------

def estimate_food_weight(image_path):
    """Estimate food weight using coin as reference scale"""
    if not coin_model:
        return {"error": "Coin detection model not available"}, None
        
    img = cv2.imread(image_path)

    # Detect coin
    coin_results = coin_model(image_path)
    coin_boxes = coin_results[0].boxes.xyxy.cpu().numpy()
    if len(coin_boxes) == 0:
        return {"error": "No coin detected! Please place a 2 Rs coin for scale."}, None

    # Take first detected coin
    (x1, y1, x2, y2) = coin_boxes[0]
    coin_diameter_px = max(x2 - x1, y2 - y1)
    px_per_cm = coin_diameter_px / COIN_DIAMETER_CM

    # Detect food
    food_results = food_model(image_path)
    total_weight = 0
    food_details = []

    for box, cls_id in zip(food_results[0].boxes.xyxy.cpu().numpy(),
                           food_results[0].boxes.cls.cpu().numpy()):
        x1, y1, x2, y2 = box
        food_name = food_model.names[int(cls_id)]

        # Convert bbox area to cm²
        width_cm = (x2 - x1) / px_per_cm
        height_cm = (y2 - y1) / px_per_cm
        area_cm2 = width_cm * height_cm

        # Get thickness for this food type
        thickness = FOOD_THICKNESS.get(food_name, 1.0)
        volume_cm3 = area_cm2 * thickness

        # Lookup density
        density = FOOD_DENSITIES.get(food_name, 0.5)

        # Weight in grams
        weight = volume_cm3 * density
        total_weight += weight

        food_details.append({
            "name": food_name,
            "weight": round(weight, 1),
            "volume_cm3": round(volume_cm3, 1),
            "area_cm2": round(area_cm2, 1),
            "density": density
        })

    return food_details, total_weight

# ---------- Food Service Initialization ----------

def load_dataset(file_path):
    """Load the food dataset"""
    if not os.path.exists(file_path):
        print(f"File not found: {os.path.abspath(file_path)}")
        return None
    
    try:
        df = pd.read_csv(file_path)
        print(f"✅ Dataset loaded: {len(df)} foods")
        return df
    except Exception as e:
        print(f"❌ Dataset load error: {str(e)}")
        return None

def initialize_service():
    """Load dataset and precompute similarity matrices"""
    df = load_dataset('./Indian_Foods_Dataset_With_Tags_Final.csv')
    
    if df is None:
        print("❌ Could not load dataset")
        return None
    
    # Basic dataset processing
    features = ['Calories', 'Carbs', 'Fats', 'Protein', 'Fiber', 'GI', 'GL', 'Insulin Index']
    
    for feature in features:
        if feature in df.columns:
            df[feature] = df[feature].fillna(0)
        else:
            print(f"⚠️ Feature '{feature}' not found")
    
    print("✅ Food service initialized")
    return {
        'full_df': df,
        'features': features
    }

print("📦 Initializing food service...")
service_data = initialize_service()

# ---------- API Endpoints ----------

@app.route('/')
def home():
    return jsonify({
        "message": "Nourish API is running!",
        "status": {
            "food_detection": food_model is not None,
            "coin_detection": coin_model is not None,
            "food_service": service_data is not None,
            "ocr": OCR_AVAILABLE
        },
        "endpoints": {
            "/detect-food": "POST - Detect food items in image",
            "/estimate-quantity": "POST - Estimate food quantity with coin reference", 
            "/detect-and-estimate": "POST - Combined detection + quantity",
            "/food-nutrition": "POST - Get nutrition info for food",
            "/recommend": "POST - Get food recommendations"
        }
    })

@app.route('/detect-food', methods=['POST'])
def detect_food():
    """Detect food items in image"""
    if not food_model:
        return jsonify({"error": "Food detection model not available"}), 503
        
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    try:
        file = request.files["file"]
        image = Image.open(file.stream).convert("RGB")
        results = food_model.predict(image)
        
        if not results[0].boxes or len(results[0].boxes.cls) == 0:
            return jsonify({"error": "No food items detected"}), 400
            
        labels = [results[0].names[cls.item()] for cls in results[0].boxes.cls]
        return jsonify({
            "detections": labels,
            "count": len(labels),
            "primary_item": labels[0]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/estimate-quantity', methods=['POST'])
def estimate_quantity():
    """Estimate food quantity and weight using coin reference"""
    if not coin_model:
        return jsonify({"error": "Coin detection model not available"}), 503
        
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    try:
        file = request.files["file"]
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        # Estimate food weight
        food_details, total_weight = estimate_food_weight(file_path)
        
        # Clean up
        if os.path.exists(file_path):
            os.remove(file_path)
        
        if isinstance(food_details, dict) and "error" in food_details:
            return jsonify(food_details), 400
        
        return jsonify({
            "success": True,
            "food_items": food_details,
            "total_weight_grams": round(total_weight, 1),
            "message": f"Estimated total weight: {total_weight:.1f} grams"
        })
        
    except Exception as e:
        return jsonify({"error": f"Quantity estimation failed: {str(e)}"}), 500

@app.route('/detect-and-estimate', methods=['POST'])
def detect_and_estimate():
    """Combined endpoint for food detection and quantity estimation"""
    if not food_model:
        return jsonify({"error": "Food detection model not available"}), 503
        
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    try:
        file = request.files["file"]
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        # Detect food items
        image = Image.open(file_path).convert("RGB")
        results = food_model.predict(image)
        
        if not results[0].boxes or len(results[0].boxes.cls) == 0:
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({"error": "No food items detected"}), 400
            
        labels = [results[0].names[cls.item()] for cls in results[0].boxes.cls]
        
        # Estimate quantity if coin is present
        quantity_data = None
        if coin_model:
            try:
                food_details, total_weight = estimate_food_weight(file_path)
                if not isinstance(food_details, dict) or "error" not in food_details:
                    quantity_data = {
                        "food_items": food_details,
                        "total_weight_grams": round(total_weight, 1)
                    }
            except Exception as e:
                print(f"Quantity estimation failed: {e}")
        
        # Clean up
        if os.path.exists(file_path):
            os.remove(file_path)
        
        response = {
            "detections": labels,
            "count": len(labels),
            "primary_item": labels[0]
        }
        
        if quantity_data:
            response["quantity_estimation"] = quantity_data
            response["has_quantity_data"] = True
        else:
            response["has_quantity_data"] = False
            response["quantity_message"] = "Coin detection not available or no coin found"
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/food-nutrition', methods=['POST'])
def food_nutrition():
    """Get nutrition information for a food"""
    if not service_data:
        return jsonify({'error': 'Food service not initialized'}), 503
        
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
        
    food_name = data.get('food_name', '').strip().lower()
    if not food_name:
        return jsonify({'error': 'Missing food_name'}), 400

    df = service_data['full_df']
    food_row = df[df['Food Name'].str.strip().str.lower() == food_name]
    
    if food_row.empty:
        return jsonify({'error': f'Nutrition info not found for {food_name}'}), 404

    food = food_row.iloc[0]
    
    nutrition = {
        'food_name': food['Food Name'].strip(),
        'category': food.get('Category', 'Unknown'),
        'calories': int(food.get('Calories', 0)),
        'carbs': float(food.get('Carbs', 0)),
        'protein': float(food.get('Protein', 0)),
        'fat': float(food.get('Fats', 0)),
        'fiber': float(food.get('Fiber', 0)),
        'glycemic_index': int(food.get('GI', 0)),
        'glycemic_load': float(food.get('GL', 0)),
        'processed_level': food.get('Processed Level', 'Unknown'),
        'portion': food.get('portion_guidance', 'Unknown'),
        'recommendation': food.get('recommendation', 'Unknown')
    }

    return jsonify(nutrition)

@app.route('/recommend', methods=['POST'])
def recommend():
    """Simple food recommendation endpoint"""
    if not service_data:
        return jsonify({'error': 'Food service not initialized'}), 503
        
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
        
    food_name = data.get('food', '').strip()
    
    if not food_name:
        return jsonify({'error': 'Missing food parameter'}), 400
    
    df = service_data['full_df']
    
    food_data = df[df['Food Name'].str.lower() == food_name.lower()]
    if food_data.empty:
        return jsonify({'error': f"Food '{food_name}' not found in database"}), 404
    
    # Simple recommendation - just return some random foods from same category
    category = food_data.iloc[0].get('Category', 'Unknown')
    similar_foods = df[df['Category'] == category].head(5)
    
    recommendations = []
    for _, food in similar_foods.iterrows():
        if food['Food Name'].lower() != food_name.lower():
            recommendations.append({
                'name': food['Food Name'],
                'category': food.get('Category', 'Unknown'),
                'calories': int(food.get('Calories', 0)),
                'carbs': float(food.get('Carbs', 0)),
                'protein': float(food.get('Protein', 0)),
                'fat': float(food.get('Fats', 0))
            })
    
    return jsonify({
        'input': food_name,
        'category': category,
        'recommendations': recommendations[:3]  # Return top 3
    })

if __name__ == "__main__":
    print("🎯 Server ready! Available endpoints:")
    print("   http://localhost:5001/")
    print("   http://localhost:5001/detect-food")
    print("   http://localhost:5001/estimate-quantity") 
    print("   http://localhost:5001/detect-and-estimate")
    print("   http://localhost:5001/food-nutrition")
    print("   http://localhost:5001/recommend")
    print("\n📢 Server starting on http://0.0.0.0:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)