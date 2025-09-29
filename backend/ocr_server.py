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

# Initialize models with correct paths
food_model = YOLO("./best.pt")
coin_model = YOLO("./best(2-rs-coin).pt")  # Make sure this file exists

# Initialize OCR with error handling
try:
    from paddleocr import PaddleOCR
    ocr = PaddleOCR(use_angle_cls=True, lang="en")
    OCR_AVAILABLE = True
    print("✅ OCR initialized successfully")
except Exception as e:
    print(f"⚠️ OCR initialization failed: {e}")
    print("⚠️ OCR features will be disabled")
    OCR_AVAILABLE = False
    ocr = None

def main():
    image_data = base64.b64decode(sys.stdin.read())
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    results = food_model.predict(image)
    label = results[0].names[results[0].boxes.cls[0].item()]
    print(label)

if __name__ == "__main__":
    main()

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
yolo_model = YOLO('./best.pt')  # Using the same food model

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # Allow up to 10MB

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Known values for quantity estimation
COIN_DIAMETER_CM = 2.7  # real 2 Rs coin diameter in cm

# Approx food densities (g/cm³) - expanded based on your dataset
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

# ---------- Initialization (Runs once at startup) ----------

def load_dataset(file_path):
    """Load the food dataset, handling both CSV and Excel formats."""
    if not os.path.exists(file_path):
        print(f"File not found: {os.path.abspath(file_path)}")
        return None
    
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        print(f"CSV read error: {str(e)}")
        try:
            df = pd.read_excel(file_path)
        except Exception as e:
            print(f"Excel read error: {str(e)}")
            return None
    return df

def categorize_food_groups(df):
    """Assign each food to a category group based on its Category column."""
    beverage_categories = ['Beverage', 'Beverages', 'Drink', 'Drinks']
    dessert_categories = ['Dessert', 'Desserts', 'Sweet', 'Sweets', 'Mithai', 'Cake', 'Pastry', 
                         'Ice Cream', 'Halwa', 'Ladoo', 'Barfi', 'Cookies', 'Pudding']
    snack_categories = ['Snack', 'Snacks', 'Chaat']
    
    def assign_group(category):
        category = str(category).lower()
        if any(bc.lower() in category for bc in beverage_categories):
            return 'beverage'
        elif any(dc.lower() in category for dc in dessert_categories):
            return 'dessert'
        elif any(sc.lower() in category for sc in snack_categories):
            return 'snack'
        else:
            return 'main'
    
    df['category_group'] = df['Category'].apply(assign_group)
    return df

def filter_diabetes_friendly_foods(df):
    """Filter foods that are suitable for diabetics with relaxed criteria for desserts."""
    diabetic_tags = ['ideal_diabetic_food', 'suitable_for_controlled_diabetes']
    good_processing = ['minimally processed', 'unprocessed']
    
    df['recommendation_lower'] = df['recommendation'].str.strip().str.lower()
    df['processed_level_lower'] = df['Processed Level'].str.strip().str.lower()
    
    standard_mask = (
        (df['category_group'] != 'dessert') &
        df['recommendation_lower'].isin(diabetic_tags) &
        df['processed_level_lower'].isin(good_processing) &
        (df['GI'] <= 55) & 
        (df['GL'] <= 10) & 
        (df['Fats'] <= 10)
    )
    
    dessert_mask = (
        (df['category_group'] == 'dessert') &
        df['recommendation_lower'].isin(diabetic_tags) &
        df['processed_level_lower'].isin(good_processing) &
        (df['GI'] <= 65) &
        (df['GL'] <= 15) &
        (df['Fats'] <= 12)
    )
    
    filtered_df = df[standard_mask | dessert_mask].copy()
    return filtered_df

def compute_group_similarities(df, features):
    """Compute similarity matrices for each category group."""
    group_matrices = {}
    group_indices = {}
    
    for group in ['beverage', 'dessert', 'snack', 'main']:
        group_df = df[df['category_group'] == group]
        
        if len(group_df) > 1:
            group_indices[group] = group_df.index
            group_features = group_df[features].fillna(0)
            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(group_features)
            similarity_matrix = cosine_similarity(scaled_features)
            group_matrices[group] = similarity_matrix
    
    return group_matrices, group_indices

def initialize_service():
    """Load dataset and precompute similarity matrices"""
    # Use your actual dataset file name
    df = load_dataset('./Indian_Foods_Dataset_With_Tags_Final.csv')
    
    if df is None:
        print("Error: Could not load dataset")
        return None
    
    features = ['Calories', 'Carbs', 'Fats', 'Protein', 'Fiber', 'GI', 'GL', 'Insulin Index']
    
    for feature in features:
        if feature not in df.columns:
            print(f"Warning: Feature '{feature}' not found in dataset.")
        else:
            df[feature] = df[feature].fillna(0)
    
    df = categorize_food_groups(df)
    filtered_df = filter_diabetes_friendly_foods(df)
    print(f"Found {len(filtered_df)} diabetes-friendly foods out of {len(df)} total foods.")
    
    dessert_count = len(filtered_df[filtered_df['category_group'] == 'dessert'])
    print(f"Found {dessert_count} diabetes-friendly desserts.")
    
    group_matrices, group_indices = compute_group_similarities(filtered_df, features)
    
    return {
        'full_df': df,
        'filtered_df': filtered_df,
        'group_matrices': group_matrices,
        'group_indices': group_indices,
        'features': features
    }

print("🚀 Initializing food service...")
service_data = initialize_service()
if service_data:
    print("✅ Food service initialized successfully!")
else:
    print("❌ Food service initialization failed!")

def handle_dessert_recommendation(food_name):
    """Special handling for dessert recommendations - always recommend fruit salad"""
    df = service_data['full_df']
    
    food_data = df[df['Food Name'].str.lower() == food_name.lower()]
    if food_data.empty:
        return jsonify({'type': 'error', 'message': f"Food '{food_name}' not found in database"}), 404
    
    fruit_salad_recommendations = [
        {
            'name': 'Fresh Fruit Salad',
            'category': 'Healthy Dessert',
            'group': 'dessert',
            'health_status': 'diabetic_friendly',
            'processed_level': 'unprocessed',
            'preparation': 'Mix fresh seasonal fruits like strawberries, kiwi, oranges, and blueberries.',
            'portion': 'One cup (about 150g)',
            'similarity': 0.95,
            'nutrition': {
                'calories': 85,
                'carbs': 21,
                'protein': 1,
                'fats': 0
            }
        },
        {
            'name': 'Citrus Fruit Salad',
            'category': 'Healthy Dessert',
            'group': 'dessert',
            'health_status': 'diabetic_friendly',
            'processed_level': 'unprocessed',
            'preparation': 'Combine oranges, grapefruit, and mandarin segments with a hint of mint.',
            'portion': 'One cup (about 150g)',
            'similarity': 0.90,
            'nutrition': {
                'calories': 70,
                'carbs': 17,
                'protein': 1,
                'fats': 0
            }
        }
    ]
    
    return jsonify({
        'type': 'fruit_salad_alternatives',
        'input': food_name,
        'health_status': 'regular',
        'message': f"Instead of {food_name}, consider these diabetes-friendly fruit salad options:",
        'recommendations': fruit_salad_recommendations,
        'fruit_salad_tips': [
            "Fresh fruit salads are naturally sweet and provide essential vitamins, minerals, and fiber",
            "The fiber in fruit helps slow sugar absorption, making it better for blood glucose control",
            "Portion control is still important - stick to the recommended serving sizes"
        ]
    })

# ---------- API Endpoints ----------

@app.route('/')
def home():
    return jsonify({
        "message": "Nourish API is running!",
        "endpoints": {
            "/detect-food": "Detect food items in image",
            "/estimate-quantity": "Estimate food quantity with coin reference",
            "/detect-and-estimate": "Combined detection and quantity estimation",
            "/recommend": "Get food recommendations",
            "/food-nutrition": "Get nutrition information",
            "/ocr": "OCR text extraction (if available)"
        },
        "status": {
            "ocr_available": OCR_AVAILABLE,
            "food_service_ready": service_data is not None
        }
    })

@app.route('/recommend', methods=['POST'])
def recommend():
    """Main recommendation endpoint for any food"""
    if not service_data:
        return jsonify({'error': 'Food service not initialized'}), 500
        
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
        
    food_name = data.get('food', '').strip()
    
    if not food_name:
        return jsonify({'error': 'Missing food parameter'}), 400
    
    df = service_data['full_df']
    filtered_df = service_data['filtered_df']
    
    food_data = df[df['Food Name'].str.lower() == food_name.lower()]
    if food_data.empty:
        return jsonify({'type': 'error', 'message': f"Food '{food_name}' not found in database"}), 404
    
    food_idx = food_data.index[0]
    food_group = food_data.iloc[0]['category_group']
    
    if food_group == 'dessert':
        return handle_dessert_recommendation(food_name)
    
    if filtered_df[filtered_df['Food Name'].str.lower() == food_name.lower()].empty:
        alternatives = get_healthy_alternatives(food_name)
        
        if isinstance(alternatives, str):
            return jsonify({'type': 'error', 'message': alternatives}), 404
        
        return jsonify({
            'type': 'alternatives',
            'input': food_name,
            'health_status': 'regular',
            'message': 'This food is not ideal for diabetics. Here are some healthy alternatives:',
            'recommendations': alternatives
        })
    else:
        recommendations = get_diabetic_recommendations(food_name)
        
        if isinstance(recommendations, str):
            return jsonify({'type': 'error', 'message': recommendations}), 404
        
        return jsonify({
            'type': 'recommendations',
            'input': food_name,
            'health_status': 'diabetic_friendly',
            'message': 'Good choice! This food is suitable for diabetics. Here are similar options:',
            'recommendations': recommendations
        })

# NEW ENDPOINT: Food Quantity Estimation
@app.route('/estimate-quantity', methods=['POST'])
def estimate_quantity():
    """Estimate food quantity and weight using coin reference"""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    try:
        file = request.files["file"]
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        # Estimate food weight
        food_details, total_weight = estimate_food_weight(file_path)
        
        # Clean up uploaded file
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

# ENHANCED ENDPOINT: Combined detection and quantity estimation
@app.route('/detect-and-estimate', methods=['POST'])
def detect_and_estimate():
    """Combined endpoint for food detection and quantity estimation"""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    try:
        file = request.files["file"]
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        # Detect food items
        image = Image.open(file_path).convert("RGB")
        results = yolo_model.predict(image)
        
        if not results[0].boxes or len(results[0].boxes.cls) == 0:
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({"error": "No food items detected"}), 400
            
        labels = [results[0].names[cls.item()] for cls in results[0].boxes.cls]
        
        # Estimate quantity if coin is present
        quantity_data = None
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
            response["quantity_message"] = "Add a 2 Rs coin for quantity estimation"
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/detect-food", methods=["POST"])
def detect_food():
    """Detect food items in image"""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    try:
        file = request.files["file"]
        image = Image.open(file.stream).convert("RGB")
        results = yolo_model.predict(image)
        
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

@app.route('/food-nutrition', methods=['POST'])
def food_nutrition():
    """Get nutrition information for a food"""
    if not service_data:
        return jsonify({'error': 'Food service not initialized'}), 500
        
    data = request.get_json()
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
        'category': food['Category'],
        'calories': int(food['Calories']),
        'carbs': float(food['Carbs']),
        'protein': float(food['Protein']),
        'fat': float(food['Fats']),
        'fiber': float(food['Fiber']),
        'glycemic_index': int(food['GI']),
        'glycemic_load': float(food['GL']),
        'processed_level': food['Processed Level'],
        'portion': food['portion_guidance'],
        'recommendation': food['recommendation']
    }

    return jsonify(nutrition)

@app.route("/ocr", methods=["POST"])
def process_image():
    """OCR text extraction"""
    if not OCR_AVAILABLE:
        return jsonify({"error": "OCR service not available"}), 503
        
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
    try:
        file.save(file_path)
        results = ocr.ocr(file_path, cls=True)
        extracted_text = "\n".join([line[1][0] for res in results for line in res])
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({"text": extracted_text})
    except Exception as e:
        return jsonify({"error": "OCR processing failed"}), 500

# Helper functions (get_diabetic_recommendations, get_healthy_alternatives, _format_recommendation)
def get_diabetic_recommendations(food_name, top_n=5):
    if not service_data:
        return "Service not initialized"
        
    df = service_data['full_df']
    filtered_df = service_data['filtered_df']
    group_matrices = service_data['group_matrices']
    group_indices = service_data['group_indices']
    
    matches = filtered_df[filtered_df['Food Name'].str.lower() == food_name.lower()]
    if matches.empty:
        return f"'{food_name}' is not found in diabetes-friendly foods."
    
    food_idx = matches.index[0]
    food_group = matches.iloc[0]['category_group']
    
    if food_group not in group_matrices:
        return f"Not enough diabetes-friendly {food_group} options for comparison."
    
    group_position = list(group_indices[food_group]).index(food_idx)
    similarity_scores = group_matrices[food_group][group_position]
    
    all_scores = list(zip(group_indices[food_group], similarity_scores))
    sorted_scores = sorted(all_scores, key=lambda x: x[1], reverse=True)
    
    recommendations = []
    for idx, score in sorted_scores[1:top_n+1]:
        recommendations.append(_format_recommendation(idx, score))
        if len(recommendations) >= top_n:
            break
    
    return recommendations

def get_healthy_alternatives(food_name, top_n=5):
    if not service_data:
        return "Service not initialized"
        
    df = service_data['full_df']
    filtered_df = service_data['filtered_df']
    features = service_data['features']
    
    food_data = df[df['Food Name'].str.lower() == food_name.lower()]
    if food_data.empty:
        return "Food not found in dataset."
    
    food_idx = food_data.index[0]
    food_group = df.loc[food_idx, 'category_group']
    
    healthy_alternatives = filtered_df[filtered_df['category_group'] == food_group]
    
    if healthy_alternatives.empty:
        return f"No healthy alternatives found in the '{food_group}' category."
    
    unhealthy_features = food_data[features].fillna(0).values
    healthy_features = healthy_alternatives[features].fillna(0).values
    
    all_features = np.vstack([unhealthy_features, healthy_features])
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(all_features)
    
    unhealthy_scaled = scaled_features[0].reshape(1, -1)
    healthy_scaled = scaled_features[1:]
    
    similarities = cosine_similarity(unhealthy_scaled, healthy_scaled)[0]
    
    alternatives = list(zip(healthy_alternatives.index, similarities))
    alternatives.sort(key=lambda x: x[1], reverse=True)
    
    results = []
    for idx, score in alternatives[:top_n]:
        results.append(_format_recommendation(idx, score))
    
    return results

def _format_recommendation(idx, score=None):
    if not service_data:
        return {"error": "Service not initialized"}
        
    df = service_data['full_df']
    filtered_df = service_data['filtered_df']
    
    if idx in filtered_df.index:
        food = filtered_df.loc[idx]
        is_diabetic_friendly = True
    elif idx in df.index:
        food = df.loc[idx]
        is_diabetic_friendly = False
    else:
        return {
            'name': 'Alternative option (details unavailable)',
            'category': 'Unknown',
            'group': 'Unknown',
            'health_status': 'Unknown',
            'processed_level': 'Unknown',
            'preparation': 'Unknown',
            'portion': 'Unknown',
            'similarity': 0,
            'nutrition': {
                'calories': 0,
                'carbs': 0,
                'protein': 0,
                'fats': 0
            }
        }
    
    return {
        'name': food['Food Name'],
        'category': food['Category'],
        'group': food['category_group'],
        'health_status': 'diabetic_friendly' if is_diabetic_friendly else 'regular',
        'processed_level': food['Processed Level'],
        'preparation': food.get('prepration_method', ''),
        'portion': food.get('portion_guidance', ''),
        'similarity': float(score) if score is not None else 0,
        'nutrition': {
            'calories': int(food['Calories']) if pd.notna(food['Calories']) else 0,
            'carbs': int(food['Carbs']) if pd.notna(food['Carbs']) else 0,
            'protein': int(food['Protein']) if pd.notna(food['Protein']) else 0,
            'fats': int(food['Fats']) if pd.notna(food['Fats']) else 0
        }
    }

if __name__ == "__main__":
    print("🚀 Starting Nourish API Server...")
    print("📝 Available endpoints:")
    print("   GET  / - API status")
    print("   POST /detect-food - Detect food items")
    print("   POST /estimate-quantity - Estimate food quantity with coin")
    print("   POST /detect-and-estimate - Combined detection + quantity")
    print("   POST /recommend - Get food recommendations")
    print("   POST /food-nutrition - Get nutrition info")
    print("   POST /ocr - OCR text extraction")
    app.run(host="0.0.0.0", port=5001, debug=True)