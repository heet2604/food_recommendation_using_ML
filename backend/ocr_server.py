from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS
import numpy as np
from ultralytics import YOLO
from PIL import Image
import cv2
import io
import tempfile


os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
# Load both models
food_model = YOLO('best.pt')  # Path to your food detection weights
coin_model = YOLO('best(2-rs-coin).pt')  # Path to your coin detection weights

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # Allow up to 10MB

ocr = PaddleOCR(use_angle_cls=True, lang="en")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Coin-based estimation configuration
COIN_DIAMETER_CM = 2.7  # real 2 Rs coin diameter in cm

# Approx food densities (g/cm³)
FOOD_DENSITIES = {
    "poha": 0.80,
    "rice": 0.75,
    "roti": 0.45,
    "dal": 0.95,
    "sabzi": 0.65,
    "egg": 0.6,
    "aloo sabji": 0.59,
    "bhakri": 0.7,
    "chole": 0.85,
    "bhindi": 0.62,
    "coconut chutney": 0.37,
    "khandvi": 1.0,
    "medu vada": 0.89,
    "omlette": 0.95,
    "yogurt": 1.031,
    "dhokla": 0.17,
    "pulao": 0.68,
    "thepla": 0.71,
    "sambhar": 0.88,
    "salad": 0.21,
    "rajma": 1.05
}

# Food thickness assumptions (in cm)
FOOD_THICKNESS = {
    "roti": 0.3,
    "poha": 0.8,
    "rice": 1.5,
    "dal": 1.0,
    "sabzi": 1.2,
    "egg": 1.0,
    "aloo sabji": 1.5,
    "bhakri": 0.4,
    "chole": 1.2,
    "bhindi": 0.8,
    "coconut chutney": 0.5,
    "khandvi": 0.5,
    "medu vada": 1.0,
    "omlette": 0.8,
    "yogurt": 1.0,
    "dhokla": 1.0,
    "pulao": 1.5,
    "thepla": 0.3,
    "sambhar": 1.0,
    "salad": 2.0,
    "rajma": 1.2
}

def estimate_food_weight(image_path):
    """Estimate food weight using coin as scale reference"""
    # Read image
    img = cv2.imread(image_path)
    original_height, original_width = img.shape[:2]
    
    # Force resize to 640x640 while maintaining aspect ratio
    target_size = 640
    scale = min(target_size / original_width, target_size / original_height)
    new_width = int(original_width * scale)
    new_height = int(original_height * scale)
    
    # Resize image
    img_resized = cv2.resize(img, (new_width, new_height))
    
    # Create a 640x640 canvas with black background
    canvas = np.zeros((target_size, target_size, 3), dtype=np.uint8)
    
    # Center the resized image on the canvas
    x_offset = (target_size - new_width) // 2
    y_offset = (target_size - new_height) // 2
    canvas[y_offset:y_offset+new_height, x_offset:x_offset+new_width] = img_resized
    
    # Save the properly sized image
    cv2.imwrite(image_path, canvas)
    
    print(f"Original: {original_width}x{original_height}, Resized: {new_width}x{new_height} on 640x640 canvas")

    # --- Detect coin ---
    coin_results = coin_model(image_path)
    coin_boxes = coin_results[0].boxes.xyxy.cpu().numpy()
    
    print(f"Coin detection: {len(coin_boxes)} coins detected")
    
    if len(coin_boxes) == 0:
        return None, "❌ No coin detected! Please place a 2 Rs coin for scale."

    # Take first detected coin
    (x1, y1, x2, y2) = coin_boxes[0]
    coin_diameter_px = max(x2 - x1, y2 - y1)
    px_per_cm = coin_diameter_px / COIN_DIAMETER_CM
    
    print(f"Coin bbox: ({x1:.1f}, {y1:.1f}, {x2:.1f}, {y2:.1f})")
    print(f"Coin diameter (px): {coin_diameter_px:.1f}")
    print(f"Pixels per cm: {px_per_cm:.2f}")

    # --- Detect food ---
    food_results = food_model(image_path)
    food_items = []
    total_weight = 0

    print(f"Food detections: {len(food_results[0].boxes)} items")

    for box, cls_id, conf in zip(food_results[0].boxes.xyxy.cpu().numpy(),
                                food_results[0].boxes.cls.cpu().numpy(),
                                food_results[0].boxes.conf.cpu().numpy()):
        x1, y1, x2, y2 = box
        food_name = food_model.names[int(cls_id)]
        confidence = float(conf)

        print(f"Food: {food_name}, Confidence: {confidence:.2f}")
        print(f"Food bbox: ({x1:.1f}, {y1:.1f}, {x2:.1f}, {y2:.1f})")

        # Convert bbox area to cm²
        width_cm = (x2 - x1) / px_per_cm
        height_cm = (y2 - y1) / px_per_cm
        area_cm2 = width_cm * height_cm

        # Get thickness based on food type
        thickness = FOOD_THICKNESS.get(food_name, 1.0)
        volume_cm3 = area_cm2 * thickness

        # Lookup density
        density = FOOD_DENSITIES.get(food_name, 0.5)

        # Weight in grams
        weight = volume_cm3 * density
        total_weight += weight

        print(f"Width: {width_cm:.1f}cm, Height: {height_cm:.1f}cm")
        print(f"Area: {area_cm2:.1f}cm², Volume: {volume_cm3:.1f}cm³")
        print(f"Density: {density}g/cm³, Calculated weight: {weight:.1f}g")

        food_items.append({
            "name": food_name,
            "weight": round(weight, 1),
            "confidence": round(confidence, 2),
            "bbox": {
                "x1": float(x1),
                "y1": float(y1),
                "x2": float(x2),
                "y2": float(y2)
            }
        })

    return food_items, total_weight

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
    # Define category mappings with expanded dessert categories
    beverage_categories = ['Beverage', 'Beverages', 'Drink', 'Drinks']
    dessert_categories = ['Dessert', 'Desserts', 'Sweet', 'Sweets', 'Mithai', 'Cake', 'Pastry', 
                         'Ice Cream', 'Halwa', 'Ladoo', 'Barfi', 'Cookies', 'Pudding']
    snack_categories = ['Snack', 'Snacks', 'Chaat']
    
    # Create a new column for category group with more flexible matching
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
    
    # Handle potential case sensitivity and whitespace
    df['recommendation_lower'] = df['recommendation'].str.strip().str.lower()
    df['processed_level_lower'] = df['Processed Level'].str.strip().str.lower()
    
    # Standard criteria for non-desserts
    standard_mask = (
        (df['category_group'] != 'dessert') &
        df['recommendation_lower'].isin(diabetic_tags) &
        df['processed_level_lower'].isin(good_processing) &
        (df['GI'] <= 55) & 
        (df['GL'] <= 10) & 
        (df['Fats'] <= 10)
    )
    
    # Relaxed criteria for desserts
    dessert_mask = (
        (df['category_group'] == 'dessert') &
        df['recommendation_lower'].isin(diabetic_tags) &
        df['processed_level_lower'].isin(good_processing) &
        (df['GI'] <= 65) &  # Relaxed GI for desserts
        (df['GL'] <= 15) &  # Relaxed GL for desserts
        (df['Fats'] <= 12)  # Slightly relaxed fat content
    )
    
    # Combine both masks to get all diabetes-friendly foods
    filtered_df = df[standard_mask | dessert_mask].copy()
    
    return filtered_df

def compute_group_similarities(df, features):
    """Compute similarity matrices for each category group."""
    group_matrices = {}
    group_indices = {}
    
    for group in ['beverage', 'dessert', 'snack', 'main']:
        group_df = df[df['category_group'] == group]
        
        if len(group_df) > 1:  # Need at least 2 items to compute similarity
            # Store indices for this group
            group_indices[group] = group_df.index
            
            # Prepare features
            group_features = group_df[features].fillna(0)
            
            # Normalize
            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(group_features)
            
            # Compute similarity
            similarity_matrix = cosine_similarity(scaled_features)
            group_matrices[group] = similarity_matrix
    
    return group_matrices, group_indices

def initialize_service():
    """Load dataset and precompute similarity matrices"""
    df = load_dataset('Indian_Foods_Dataset_With_Tags_Final.csv')
    
    if df is None:
        print("Error: Could not load dataset")
        return None
    
    # Define features for similarity calculation
    features = ['Calories', 'Carbs', 'Fats', 'Protein', 'Fiber', 'GI', 'GL', 'Insulin Index']
    
    # Ensure all feature columns exist and handle missing values
    for feature in features:
        if feature not in df.columns:
            print(f"Warning: Feature '{feature}' not found in dataset.")
        else:
            df[feature] = df[feature].fillna(0)
    
    # Categorize foods into groups
    df = categorize_food_groups(df)
    
    # Filter diabetes-friendly foods with relaxed criteria for desserts
    filtered_df = filter_diabetes_friendly_foods(df)
    print(f"Found {len(filtered_df)} diabetes-friendly foods out of {len(df)} total foods.")
    
    # Count diabetes-friendly desserts
    dessert_count = len(filtered_df[filtered_df['category_group'] == 'dessert'])
    print(f"Found {dessert_count} diabetes-friendly desserts.")
    
    # Compute similarity matrices for each group
    group_matrices, group_indices = compute_group_similarities(filtered_df, features)
    
    return {
        'full_df': df,
        'filtered_df': filtered_df,
        'group_matrices': group_matrices,
        'group_indices': group_indices,
        'features': features
    }

service_data = initialize_service()

# Define handle_dessert_recommendation BEFORE it's called in the recommend function
def handle_dessert_recommendation(food_name):
    """Special handling for dessert recommendations - always recommend fruit salad"""
    df = service_data['full_df']
    
    food_data = df[df['Food Name'].str.lower() == food_name.lower()]
    if food_data.empty:
        return jsonify({'type': 'error', 'message': f"Food '{food_name}' not found in database"}), 404
    
    # Create fruit salad recommendations
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
        },
        {
            'name': 'Berry Fruit Salad',
            'category': 'Healthy Dessert',
            'group': 'dessert',
            'health_status': 'diabetic_friendly',
            'processed_level': 'unprocessed',
            'preparation': 'Mix strawberries, blueberries, raspberries, and blackberries.',
            'portion': 'One cup (about 150g)',
            'similarity': 0.85,
            'nutrition': {
                'calories': 75,
                'carbs': 16,
                'protein': 1,
                'fats': 0
            }
        },
        {
            'name': 'Tropical Fruit Salad',
            'category': 'Healthy Dessert',
            'group': 'dessert',
            'health_status': 'diabetic_friendly',
            'processed_level': 'unprocessed',
            'preparation': 'Combine pineapple, mango, kiwi, and banana in small portions.',
            'portion': 'Half cup (about 75g)',
            'similarity': 0.80,
            'nutrition': {
                'calories': 90,
                'carbs': 23,
                'protein': 1,
                'fats': 0
            }
        },
        {
            'name': 'Yogurt Fruit Salad',
            'category': 'Healthy Dessert',
            'group': 'dessert',
            'health_status': 'diabetic_friendly',
            'processed_level': 'minimally processed',
            'preparation': 'Mix fresh fruits with a small amount of plain Greek yogurt and a sprinkle of nuts.',
            'portion': 'One cup (about 175g)',
            'similarity': 0.75,
            'nutrition': {
                'calories': 120,
                'carbs': 20,
                'protein': 7,
                'fats': 2
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
            "Portion control is still important - stick to the recommended serving sizes",
            "Add nuts or seeds for healthy fats and protein to further reduce glycemic impact",
            "Avoid adding sugar or honey; use spices like cinnamon or vanilla for extra flavor",
            "Fruits should ideally be eaten at least 30 minutes to an hour before a meal for better digestion"
        ]
    })

# ---------- API Endpoints ----------

@app.route('/recommend', methods=['POST'])
def recommend():
    """Main recommendation endpoint for any food"""
    data = request.get_json()
    food_name = data.get('food', '').strip()
    
    if not food_name:
        return jsonify({'error': 'Missing food parameter'}), 400
    
    df = service_data['full_df']
    filtered_df = service_data['filtered_df']
    features = service_data['features']
    
    # Check if food exists in original dataset
    food_data = df[df['Food Name'].str.lower() == food_name.lower()]
    if food_data.empty:
        return jsonify({'type': 'error', 'message': f"Food '{food_name}' not found in database"}), 404
    
    food_idx = food_data.index[0]
    food_group = food_data.iloc[0]['category_group']
    
    # Special handling for desserts
    if food_group == 'dessert':
        return handle_dessert_recommendation(food_name)
    
    # Regular flow for non-desserts
    # Check if food is in diabetes-friendly dataset
    if filtered_df[filtered_df['Food Name'].str.lower() == food_name.lower()].empty:
        # Food is not diabetes-friendly, recommend alternatives
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
        # Food is diabetes-friendly, recommend similar foods
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

def get_diabetic_recommendations(food_name, top_n=5):
    """Get similar diabetes-friendly food recommendations within the same category group."""
    df = service_data['full_df']
    filtered_df = service_data['filtered_df']
    group_matrices = service_data['group_matrices']
    group_indices = service_data['group_indices']
    features = service_data['features']
    
    # Find food in filtered dataset
    matches = filtered_df[filtered_df['Food Name'].str.lower() == food_name.lower()]
    if matches.empty:
        return f"'{food_name}' is not found in diabetes-friendly foods."
    
    food_idx = matches.index[0]
    food_group = matches.iloc[0]['category_group']
    
    # Check if we have similarity data for this group
    if food_group not in group_matrices:
        return f"Not enough diabetes-friendly {food_group} options for comparison."
    
    # Get position in the group similarity matrix
    group_position = list(group_indices[food_group]).index(food_idx)
    similarity_scores = group_matrices[food_group][group_position]
    
    # Create (index, score) pairs for all foods in this group
    all_scores = list(zip(group_indices[food_group], similarity_scores))
    
    # Sort by similarity (excluding the food itself)
    sorted_scores = sorted(all_scores, key=lambda x: x[1], reverse=True)
    
    # Get recommendations (skip first as it's the input food)
    recommendations = []
    for idx, score in sorted_scores[1:]:
        recommendations.append(_format_recommendation(idx, score))
        if len(recommendations) >= top_n:
            break
    
    return recommendations

def get_healthy_alternatives(food_name, top_n=5):
    """Recommend healthy alternatives from the same category group when an unhealthy food is queried."""
    df = service_data['full_df']
    filtered_df = service_data['filtered_df']
    features = service_data['features']
    
    # Check if food exists in original dataset
    food_data = df[df['Food Name'].str.lower() == food_name.lower()]
    if food_data.empty:
        return "Food not found in dataset."
    
    # Get the category group of the unhealthy food
    food_idx = food_data.index[0]
    food_group = df.loc[food_idx, 'category_group']
    
    # Filter healthy alternatives from the same category group
    healthy_alternatives = filtered_df[filtered_df['category_group'] == food_group]
    
    if healthy_alternatives.empty:
        return f"No healthy alternatives found in the '{food_group}' category."
    
    # Calculate similarity between unhealthy food and healthy alternatives
    # Prepare features for similarity calculation
    unhealthy_features = food_data[features].fillna(0).values
    healthy_features = healthy_alternatives[features].fillna(0).values
    
    # Normalize all features together
    all_features = np.vstack([unhealthy_features, healthy_features])
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(all_features)
    
    # Separate back into unhealthy and healthy
    unhealthy_scaled = scaled_features[0].reshape(1, -1)
    healthy_scaled = scaled_features[1:]
    
    # Calculate similarity
    similarities = cosine_similarity(unhealthy_scaled, healthy_scaled)[0]
    
    # Create (index, score) pairs and sort
    alternatives = list(zip(healthy_alternatives.index, similarities))
    alternatives.sort(key=lambda x: x[1], reverse=True)
    
    # Format results
    results = []
    for idx, score in alternatives[:top_n]:
        results.append(_format_recommendation(idx, score))
    
    return results

def _format_recommendation(idx, score=None):
    """Format a recommendation for output"""
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

# ---------- OCR Endpoint (unchanged) ----------

@app.route("/ocr", methods=["POST"])
def process_image():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
    try:
        file.save(file_path)
        results = ocr.ocr(file_path, cls=True)
        extracted_text = "\n".join([line[1][0] for res in results for line in res])
        os.remove(file_path)
        return jsonify({"text": extracted_text})
    except Exception as e:
        return jsonify({"error": "OCR processing failed"}), 500


# Updated Food Detection Endpoint with Coin-based Quantity Estimation
@app.route("/detect-food", methods=["POST"])
def detect_food():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    try:
        file = request.files["file"]
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        # Estimate food weight using coin-based method
        food_items, total_weight = estimate_food_weight(temp_path)
        
        # Clean up temp file
        os.unlink(temp_path)
        
        if isinstance(total_weight, str):  # Error message
            return jsonify({"error": total_weight}), 400
            
        if not food_items:
            return jsonify({"error": "No food items detected"}), 400
        
        # Get detection labels for backward compatibility
        labels = [item["name"] for item in food_items]
        
        return jsonify({
            "detections": labels,
            "count": len(labels),
            "primary_item": labels[0],  # Most confident detection
            "detailed_detections": food_items,
            "total_weight_grams": round(total_weight, 1),
            "estimation_method": "coin_scale"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Updated Nutrition Endpoint to Support Weight-based Calculations
@app.route('/food-nutrition', methods=['POST'])
def food_nutrition():
    data = request.get_json()
    food_name = data.get('food_name', '').strip().lower()
    weight_grams = data.get('weight_grams', 100)  # Default to 100g if not provided
    
    if not food_name:
        return jsonify({'error': 'Missing food_name'}), 400

    # Get the preloaded DataFrame
    df = service_data['full_df']
    
    # Case-insensitive search with whitespace handling
    food_row = df[df['Food Name'].str.strip().str.lower() == food_name]
    
    if food_row.empty:
        return jsonify({'error': f'Nutrition info not found for {food_name}'}), 404

    food = food_row.iloc[0]
    
    # Calculate nutrition based on actual weight
    weight_factor = weight_grams / 100.0
    
    # Map all CSV columns to API response
    nutrition = {
        'food_name': food['Food Name'].strip(),
        'category': food['Category'],
        'calories': int(food['Calories'] * weight_factor),
        'carbs': float(food['Carbs'] * weight_factor),
        'protein': float(food['Protein'] * weight_factor),
        'fat': float(food['Fats'] * weight_factor),
        'fiber': float(food['Fiber'] * weight_factor),
        'glycemic_index': int(food['GI']),
        'glycemic_load': float(food['GL'] * weight_factor),
        'processed_level': food['Processed Level'],
        'portion': food['portion_guidance'],
        'recommendation': food['recommendation'],
        'serving_size_grams': weight_grams,
        'base_serving_size': 100  # Original database serving size
    }

    return jsonify(nutrition)


# ---------- Error Handling ----------

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)