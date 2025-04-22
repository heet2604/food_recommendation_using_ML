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

# Update to use correct recommendation column and diabetic tags
filtered_df = df[df['recommendation'].str.contains('diabetic', case=False, na=False)]

# Corrected feature columns to match CSV
features = ['Calories', 'Carbs', 'Protein', 'Fats', 'GI']  # Matches CSV columns

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


# ---------- Initialization (Runs once at startup) ----------
def load_dataset(file_path):
    """Load the food dataset with validation"""
    import os
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

def initialize_service():
    """Load dataset and precompute similarity matrices"""
    # Load and prepare data
    df = load_dataset('Indian_Foods_Dataset_With_Tags_Final.csv')
    # df = load_dataset('C:/Users/samk/\Documents/restructured_Nourish/food_recommendation_using_ML/Indian_Foods_Dataset_With_Tags_Final[1].csv')
    df = _categorize_food_groups(df)
    filtered_df = _filter_diabetes_friendly_foods(df)
    
    # Precompute similarity matrices for all groups
    features = ['Calories','Carbs','Fats','Protein','Fiber','GI','GL','Insulin Index']
    group_matrices, group_indices = _compute_group_similarities(filtered_df, features)
    
    # Save for API endpoints
    return {
        'full_df': df,
        'filtered_df': filtered_df,
        'group_matrices': group_matrices,
        'group_indices': group_indices,
        'features': features
    }

def _categorize_food_groups(df):
    """From notebook Step 2"""
    beverage_cats = ['Beverage', 'Beverages', 'Drink', 'Drinks']
    dessert_cats = ['Dessert', 'Desserts', 'Sweet', 'Sweets', 'Mithai']
    snack_cats = ['Snack', 'Snacks', 'Chaat']
    
    df['category_group'] = df['Category'].apply(
        lambda x: 'beverage' if x in beverage_cats else
                  'dessert' if x in dessert_cats else
                  'snack' if x in snack_cats else 'main')
    return df

def _filter_diabetes_friendly_foods(df):
    """From notebook Step 3"""
    return df[
        (df['recommendation'].str.strip().str.lower().isin(['ideal_diabetic_food', 'suitable_for_controlled_diabetes'])) &
        (df['Processed Level'].str.strip().str.lower().isin(['minimally processed', 'unprocessed'])) &
        (df['GI'] <= 55) &
        (df['GL'] <= 10) &
        (df['Fats'] <= 10)
    ].copy()

def _compute_group_similarities(df, features):
    """From notebook Step 4"""
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

# Initialize service components
service_data = initialize_service()

# ---------- API Endpoints ----------
@app.route('/recommend', methods=['POST'])
def recommend():
    """Main recommendation endpoint combining notebook Steps 5-7"""
    data = request.get_json()
    food_name = data.get('food', '').strip()
    
    if not food_name:
        return jsonify({'error': 'Missing food parameter'}), 400

    # Check if food is diabetes-friendly
    in_filtered = service_data['filtered_df'][
        service_data['filtered_df']['Food Name'].str.lower() == food_name.lower()
    ]
    
    if not in_filtered.empty:
        # Diabetic recommendation (Step 5)
        results = _get_diabetic_recommendations(food_name)
    else:
        # Healthy alternatives (Step 6)
        results = _get_healthy_alternatives(food_name)
    
    return jsonify(results)

def _get_diabetic_recommendations(food_name):
    """From notebook Step 5"""
    food_data = service_data['filtered_df'][
        service_data['filtered_df']['Food Name'].str.lower() == food_name.lower()
    ].iloc[0]
    
    group = food_data['category_group']
    group_idx = service_data['group_indices'][group].index(food_data.name)
    
    # Get similarity scores
    sim_scores = list(enumerate(service_data['group_matrices'][group][group_idx]))
    sorted_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:6]
    
    return {
        'type': 'diabetic_recommendations',
        'input': food_data['Food Name'],
        'recommendations': [_format_recommendation(idx) for idx, _ in sorted_scores]
    }

def _get_healthy_alternatives(food_name):
    """From notebook Step 6"""
    food_data = service_data['full_df'][
        service_data['full_df']['Food Name'].str.lower() == food_name.lower()
    ].iloc[0]
    
    group = food_data['category_group']
    healthy_in_group = service_data['filtered_df'][
        service_data['filtered_df']['category_group'] == group
    ]
    
    # Calculate similarity
    scaler = StandardScaler()
    unhealthy_features = food_data[service_data['features']].fillna(0).values.reshape(1, -1)
    healthy_features = healthy_in_group[service_data['features']].fillna(0).values
    all_features = scaler.fit_transform(np.vstack([unhealthy_features, healthy_features]))
    
    similarities = cosine_similarity(all_features[0:1], all_features[1:])[0]
    top_indices = similarities.argsort()[::-1][:5]
    
    return {
        'type': 'healthy_alternatives',
        'input': food_data['Food Name'],
        'recommendations': [
            _format_recommendation(healthy_in_group.index[i]) 
            for i in top_indices
        ]
    }

def _format_recommendation(idx):
    """Helper to format recommendation output"""
    food = service_data['filtered_df'].loc[idx]
    return {
        'name': food['Food Name'],
        'category': food['Category'],
        'group': food['category_group'],
        'processed_level': food['Processed Level'],
        'preparation': food['prepration_method'],
        'portion': food['portion_guidance'],
        'nutrition': {
            'calories': int(food['Calories']),
            'carbs': int(food['Carbs']),
            'protein': int(food['Protein']),
            'fats': int(food['Fats'])
        }
    }

# ---------- Additional Endpoints ----------
@app.route('/health-analysis', methods=['POST'])
def health_analysis():
    """Get detailed nutritional analysis (from notebook filtering logic)"""
    food_name = request.json.get('food', '').strip()
    food_data = service_data['full_df'][
        service_data['full_df']['Food Name'].str.lower() == food_name.lower()
    ]
    
    if food_data.empty:
        return jsonify({'error': 'Food not found'}), 404
        
    food = food_data.iloc[0]
    return jsonify({
        'name': food['Food Name'],
        'diabetes_friendly': food.name in service_data['filtered_df'].index,
        'nutrition': {
            'calories': int(food['Calories']),
            'carbs': int(food['Carbs']),
            'protein': int(food['Protein']),
            'fats': int(food['Fats']),
            'gi': int(food['GI']),
            'gl': int(food['GL'])
        },
        'processing': food['Processed Level'],
        'portion_guidance': food['portion_guidance']
    })

@app.route('/is-diabetic-friendly', methods=['POST'])
def is_diabetic_friendly():
    """Quick check endpoint"""
    food_name = request.json.get('food', '').strip()
    exists = not service_data['filtered_df'][
        service_data['filtered_df']['Food Name'].str.lower() == food_name.lower()
    ].empty
    return jsonify({'result': exists})

# ---------- Error Handling ----------
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
