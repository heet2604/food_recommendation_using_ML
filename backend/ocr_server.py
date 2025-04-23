from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS
import numpy as np

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

app = Flask(__name__)
CORS()

ocr = PaddleOCR(use_angle_cls=True, lang="en")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load dataset with proper column names
df = pd.read_csv('Indian_Foods_Dataset_With_Tags_Final.csv')
df.columns = df.columns.str.strip()

# ---------- Initialization (Runs once at startup) ----------
def load_dataset(file_path):
    """Load the food dataset with validation"""
    if not os.path.exists(file_path):
        print(f"File not found: {os.path.abspath(file_path)}")
        return None
    try:
        return pd.read_csv(file_path)
    except Exception as e:
        print(f"CSV read error: {str(e)}")
        try:    
            return pd.read_excel(file_path)
        except Exception as e:
            print(f"Excel read error: {str(e)}")
            return None

def _categorize_food_groups(df):
    """Assign category_group for each food"""
    beverage_cats = ['Beverage', 'Beverages', 'Drink', 'Drinks']
    dessert_cats = ['Dessert', 'Desserts', 'Sweet', 'Sweets', 'Mithai']
    snack_cats = ['Snack', 'Snacks', 'Chaat']
    df['category_group'] = df['Category'].apply(
        lambda x: 'beverage' if x in beverage_cats else
                  'dessert' if x in dessert_cats else
                  'snack' if x in snack_cats else 'main')
    return df

def _mark_health_status(df):
    """Mark each food as diabetic-friendly or regular"""
    all_foods_df = df.copy()
    all_foods_df['health_status'] = 'regular'
    diabetic_mask = (
        (df['recommendation'].str.strip().str.lower().isin(['ideal_diabetic_food', 'suitable_for_controlled_diabetes'])) &
        (df['Processed Level'].str.strip().str.lower().isin(['minimally processed', 'unprocessed'])) &
        (df['GI'] <= 55) &
        (df['GL'] <= 10) &
        (df['Fats'] <= 10)
    )
    all_foods_df.loc[diabetic_mask, 'health_status'] = 'diabetic_friendly'
    return all_foods_df.reset_index(drop=True)

def _compute_group_similarities(df, features):
    """Precompute similarity matrices for all groups"""
    group_matrices = {}
    group_indices = {}
    for group in ['beverage', 'dessert', 'snack', 'main']:
        group_df = df[df['category_group'] == group]
        if len(group_df) > 1:
            scaler = StandardScaler()
            scaled = scaler.fit_transform(group_df[features].fillna(0))
            group_matrices[group] = cosine_similarity(scaled)
            group_indices[group] = group_df.index.tolist()
    return group_matrices, group_indices

def initialize_service():
    """Load dataset and precompute similarity matrices"""
    df = load_dataset('Indian_Foods_Dataset_With_Tags_Final.csv')
    df = _categorize_food_groups(df)
    df = _mark_health_status(df)
    features = ['Calories','Carbs','Fats','Protein','Fiber','GI','GL','Insulin Index']
    group_matrices, group_indices = _compute_group_similarities(df, features)
    return {
        'full_df': df,
        'group_matrices': group_matrices,
        'group_indices': group_indices,
        'features': features
    }

service_data = initialize_service()

# ---------- API Endpoints ----------
@app.route('/recommend', methods=['POST'])
def recommend():
    """Main recommendation endpoint for any food"""
    data = request.get_json()
    food_name = data.get('food', '').strip()
    if not food_name:
        return jsonify({'error': 'Missing food parameter'}), 400

    # Try to find the food in the dataset
    df = service_data['full_df']
    food_row = df[df['Food Name'].str.lower() == food_name.lower()]
    if food_row.empty:
        return jsonify({'type': 'error', 'message': f"Food '{food_name}' not found in database"}), 404

    food_data = food_row.iloc[0]
    group = food_data['category_group']

    # Recommend similar foods from the same group (regardless of health status)
    group_foods = df[df['category_group'] == group]
    if len(group_foods) <= 1:
        return jsonify({'type': 'error', 'message': f"No similar foods found for '{food_name}' in group '{group}'"}), 404

    # Similarity calculation
    scaler = StandardScaler()
    features = service_data['features']
    food_features = food_data[features].fillna(0).values.reshape(1, -1)
    group_features = group_foods[features].fillna(0).values
    all_features = scaler.fit_transform(np.vstack([food_features, group_features]))
    similarities = cosine_similarity(all_features[0:1], all_features[1:])[0]
    top_indices = similarities.argsort()[::-1][:5]
    recommendation_indices = group_foods.iloc[top_indices].index.tolist()

    return jsonify({
        'type': 'recommendations',
        'input': food_data['Food Name'],
        'health_status': food_data['health_status'],
        'recommendations': [_format_recommendation(idx) for idx in recommendation_indices]
    })

def _format_recommendation(idx):
    """Format a recommendation for output"""
    df = service_data['full_df']
    if idx in df.index:
        food = df.loc[idx]
        return {
            'name': food['Food Name'],
            'category': food['Category'],
            'group': food['category_group'],
            'health_status': food['health_status'],
            'processed_level': food['Processed Level'],
            'preparation': food.get('prepration_method', ''),
            'portion': food.get('portion_guidance', ''),
            'nutrition': {
                'calories': int(food['Calories']) if pd.notna(food['Calories']) else 0,
                'carbs': int(food['Carbs']) if pd.notna(food['Carbs']) else 0,
                'protein': int(food['Protein']) if pd.notna(food['Protein']) else 0,
                'fats': int(food['Fats']) if pd.notna(food['Fats']) else 0
            }
        }
    else:
        return {
            'name': 'Alternative option (details unavailable)',
            'category': 'Unknown',
            'group': 'Unknown',
            'health_status': 'Unknown',
            'processed_level': 'Unknown',
            'preparation': 'Unknown',
            'portion': 'Unknown',
            'nutrition': {
                'calories': 0,
                'carbs': 0,
                'protein': 0,
                'fats': 0
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

# ---------- Error Handling ----------
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
