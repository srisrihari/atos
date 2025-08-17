import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, render_template, send_file, abort
from werkzeug.utils import secure_filename
import plotly.graph_objects as go
from scipy.stats import gaussian_kde
import tempfile
import json
import logging
import traceback
from sklearn.datasets import load_iris, load_diabetes, load_breast_cancer, load_wine, fetch_california_housing
from ml_processor import MLProcessor, MODEL_ALIASES
from business_intelligence import BusinessIntelligence
from reporting import BusinessReporter
from gemini_ai import GeminiAI
from datetime import datetime, date, timedelta
import requests
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
import re
from urllib.parse import urlparse
import uuid
import math
import numpy as np
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CustomJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle NaN, infinity, and other problematic values"""
    def default(self, obj):
        if isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
            return int(obj)
        elif isinstance(obj, (np.floating, np.float64, np.float32, np.float16)):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return float(obj)
        elif isinstance(obj, np.ndarray):
            if obj.dtype.kind in 'fc':  # float or complex
                return [None if np.isnan(x) or np.isinf(x) else float(x) for x in obj.tolist()]
            return obj.tolist()
        elif isinstance(obj, pd.Series):
            return [None if pd.isna(x) else x for x in obj.tolist()]
        elif isinstance(obj, pd.DataFrame):
            return obj.to_dict('records')
        elif isinstance(obj, float):
            if math.isnan(obj) or math.isinf(obj):
                return None
            return obj
        return super().default(obj)

app = Flask(__name__)
app.json_encoder = CustomJSONEncoder
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['SECRET_KEY'] = os.urandom(24)
app.config['DATA_UPLOAD_API_KEY'] = os.environ.get('DATA_UPLOAD_API_KEY', None)
app.config['NEWS_API_KEY'] = os.environ.get('NEWS_API_KEY', None)

# Global variable to track the most recently uploaded file
most_recent_uploaded_file = None

# Global instances
ml_processor = None
business_intelligence = None
business_reporter = None
gemini_ai = None

# Initialize Gemini AI if API key is available
try:
    gemini_ai = GeminiAI("AIzaSyCLxCR0_HOX-abVRWhWdIlRqujwxEaupvk")
    logger.info("Gemini AI initialized successfully")
except Exception as e:
    logger.warning(f"Gemini AI not available: {str(e)}")
    gemini_ai = None

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_to_json_serializable(obj):
    """Convert numpy/pandas objects to JSON serializable format"""
    if obj is None:
        return None
    elif isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32, np.float16)):
        # Handle NaN and infinity values
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, np.ndarray):
        # Handle NaN values in arrays
        if obj.dtype.kind in 'fc':  # float or complex
            return [None if np.isnan(x) or np.isinf(x) else float(x) for x in obj.tolist()]
        return obj.tolist()
    elif isinstance(obj, pd.Series):
        # Handle NaN values in pandas Series
        return [None if pd.isna(x) else convert_to_json_serializable(x) for x in obj.tolist()]
    elif isinstance(obj, pd.DataFrame):
        return obj.to_dict('records')
    elif isinstance(obj, dict):
        return {key: convert_to_json_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_json_serializable(item) for item in obj]
    elif isinstance(obj, (str, int, float, bool)):
        # Handle NaN in float values
        if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
            return None
        return obj
    else:
        # For any other type, try to convert to string
        try:
            return str(obj)
        except:
            return None

@app.route('/')
def home():
    return render_template('get_started.html')



@app.route('/profile')
def profile_page():
    return render_template('profile.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    global ml_processor, business_intelligence, business_reporter, most_recent_uploaded_file
    
    try:
        # Optional API key check
        expected = app.config.get('DATA_UPLOAD_API_KEY')
        provided = request.headers.get('X-API-Key') or request.args.get('api_key')
        if expected:
            if not provided or provided != expected:
                return jsonify({'status': 'error', 'message': 'Invalid API key'}), 401
        if 'file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No file uploaded'
            })
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No file selected'
            })

        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Update global variable
        most_recent_uploaded_file = filepath

        # Initialize MLProcessor with the uploaded file
        try:
            ml_processor = MLProcessor(data_path=filepath)
            
            # Initialize Business Intelligence
            business_intelligence = BusinessIntelligence(ml_processor.data)
            business_reporter = BusinessReporter(business_intelligence)
            
            return jsonify({
                'status': 'success',
                'message': 'File uploaded successfully',
                'columns': ml_processor.data.columns.tolist(),
                'shape': ml_processor.data.shape
            })
            
        except Exception as e:
            # Clean up the uploaded file if processing fails
            if os.path.exists(filepath):
                os.remove(filepath)
            raise ValueError(f"Error processing file: {str(e)}")

    except Exception as e:
        app.logger.error(f"Error uploading file: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error uploading file: {str(e)}"
        })

@app.route('/load_example_dataset/<dataset_name>', methods=['GET'])
def load_example_dataset(dataset_name):
    global ml_processor, business_intelligence, business_reporter, most_recent_uploaded_file
    
    try:
        # Load the selected dataset
        if dataset_name == 'iris':
            data = load_iris()
        elif dataset_name == 'california':
            data = fetch_california_housing()
        elif dataset_name == 'diabetes':
            data = load_diabetes()
        elif dataset_name == 'breast_cancer':
            data = load_breast_cancer()
        elif dataset_name == 'wine':
            data = load_wine()
        else:
            return jsonify({
                'status': 'error',
                'message': 'Invalid dataset name'
            })

        # Convert to DataFrame
        df = pd.DataFrame(data.data, columns=data.feature_names)
        if hasattr(data, 'target'):
            df['target'] = data.target

        # Save to temporary file
        temp_file = os.path.join(app.config['UPLOAD_FOLDER'], f'{dataset_name}_temp.csv')
        df.to_csv(temp_file, index=False)
        
        # Update global variable
        most_recent_uploaded_file = temp_file

        # Initialize processors
        ml_processor = MLProcessor(data_path=temp_file)
        business_intelligence = BusinessIntelligence(ml_processor.data)
        business_reporter = BusinessReporter(business_intelligence)

        return jsonify({
            'status': 'success',
            'message': f'{dataset_name} dataset loaded successfully',
            'columns': df.columns.tolist(),
            'shape': df.shape
        })

    except Exception as e:
        app.logger.error(f"Error loading example dataset: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error loading dataset: {str(e)}"
        })

@app.route('/detect_problem_type', methods=['POST'])
def detect_problem():
    try:
        data = request.get_json()
        target_column = data.get('target_column')
        
        if not ml_processor:
            return jsonify({
                'status': 'error',
                'message': 'Please upload or select a dataset first'
            })
        
        problem_type = ml_processor.detect_problem_type(target_column)
        
        return jsonify({
            'status': 'success',
            'problem_type': problem_type
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/analyze_bias', methods=['POST'])
def analyze_bias():
    try:
        if not ml_processor:
            return jsonify({
                'status': 'error',
                'message': 'Please upload or select a dataset first'
            })
        
        data = request.get_json()
        if not data or 'target_column' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Target column not specified'
            })
        
        target_column = data['target_column']
        
        # First detect problem type
        problem_type = ml_processor.detect_problem_type(target_column)
        
        # Then analyze bias
        bias_report = ml_processor.analyze_data_bias()
        
        return jsonify({
            'status': 'success',
            'problem_type': problem_type,
            'bias_report': bias_report
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/preprocess', methods=['POST'])
def preprocess():
    try:
        if not ml_processor:
            return jsonify({
                'status': 'error',
                'message': 'Please upload or select a dataset first'
            })
        
        data = request.get_json()
        if not data or 'target_column' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Target column not specified'
            })
        
        test_size = data.get('test_size', 0.2)
        handle_imbalance = data.get('handle_imbalance', True)
        
        # Preprocess the data
        preprocessing_results = ml_processor.preprocess_data(
            test_size=test_size,
            handle_imbalance=handle_imbalance
        )
        
        # Ensure we have the expected structure
        if not preprocessing_results:
            preprocessing_results = {}
        
        # Add basic shape information if not present
        if 'train_shape' not in preprocessing_results and hasattr(ml_processor, 'X_train'):
            preprocessing_results['train_shape'] = {
                'X': list(ml_processor.X_train.shape),
                'y': list(np.shape(ml_processor.y_train))
            }
        if 'test_shape' not in preprocessing_results and hasattr(ml_processor, 'X_test'):
            preprocessing_results['test_shape'] = {
                'X': list(ml_processor.X_test.shape),
                'y': list(np.shape(ml_processor.y_test))
            }
        
        return jsonify({
            'status': 'success',
            'preprocessing_results': preprocessing_results
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/train_model', methods=['POST'])
def train_model():
    try:
        app.logger.info("Received training request")
        
        if not ml_processor:
            return jsonify({
                'status': 'error',
                'message': 'Please upload or select a dataset first'
            })

        data = request.get_json()
        model_type = data.get('model_type')
        
        app.logger.info(f"Requested model type: {model_type}")
        
        if not model_type:
            return jsonify({
                'status': 'error',
                'message': 'Model type not specified'
            })

        # Map model alias to actual model type
        if model_type in MODEL_ALIASES:
            original_type = model_type
            model_type = MODEL_ALIASES[model_type]
            app.logger.info(f"Mapped model type from {original_type} to {model_type}")

        # Train the model and get results
        app.logger.info("Starting model training...")
        results = ml_processor.train_model(model_type)
        
        # Log the complete results
        app.logger.info("Training completed. Results:")
        app.logger.info(f"Status: {results.get('status')}")
        app.logger.info(f"Message: {results.get('message')}")
        app.logger.info(f"Train shape: {results.get('train_shape')}")
        app.logger.info(f"Test shape: {results.get('test_shape')}")
        
        return jsonify(results)

    except Exception as e:
        app.logger.error(f"Error in train_model endpoint: {str(e)}")
        app.logger.error(f"Stack trace: {traceback.format_exc()}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/tune_hyperparameters', methods=['POST'])
def tune_hyperparameters():
    try:
        data = request.get_json()
        n_trials = data.get('n_trials', 100)
        cv_folds = data.get('cv_folds', 5)
        cv_strategy = data.get('cv_strategy', 'kfold')
        model_type = data.get('model_type')

        if not model_type:
            return jsonify({'error': 'Model type is required'}), 400

        best_params = ml_processor.tune_hyperparameters(
            model_type=model_type,
            n_trials=n_trials,
            cv_folds=cv_folds,
            cv_strategy=cv_strategy
        )

        return jsonify({'best_params': best_params})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/visualizations', methods=['GET'])
def get_visualizations():
    try:
        if not ml_processor:
            return jsonify({
                'status': 'error',
                'message': 'Please upload or select a dataset first'
            })
        
        plots = ml_processor.create_visualizations()
        
        return jsonify({
            'status': 'success',
            'plots': plots
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/save_model', methods=['POST'])
def save():
    try:
        data = request.get_json()
        model_name = data.get('model_name', 'model.joblib')
        
        if not ml_processor:
            return jsonify({
                'status': 'error',
                'message': 'Please upload or select a dataset first'
            })
        
        # Create models directory if it doesn't exist
        models_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'models')
        os.makedirs(models_dir, exist_ok=True)
        
        # Save the model
        model_path = os.path.join(models_dir, model_name)
        save_result = ml_processor.save_model(model_path)
        
        return jsonify({
            'status': 'success',
            'message': save_result['message']
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/advanced_eda', methods=['GET'])
def advanced_eda():
    try:
        if ml_processor is None or ml_processor.data is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })

        data = ml_processor.data
        numeric_cols = data.select_dtypes(include=[np.number]).columns
        categorical_cols = data.select_dtypes(exclude=[np.number]).columns

        # Basic statistics for numeric columns
        numeric_stats = data[numeric_cols].describe().round(2).to_dict()

        # Correlation matrix
        correlation_matrix = data[numeric_cols].corr().round(3)
        correlation_plot = {
            'data': [{
                'type': 'heatmap',
                'z': correlation_matrix.values.tolist(),
                'x': correlation_matrix.columns.tolist(),
                'y': correlation_matrix.columns.tolist(),
                'colorscale': 'RdBu',
                'zmin': -1,
                'zmax': 1,
                'colorbar': {'title': 'Correlation'}
            }],
            'layout': {
                'title': 'Correlation Matrix',
                'width': 800,
                'height': 800,
                'xaxis': {'tickangle': 45},
                'margin': {'l': 150, 'r': 50, 't': 50, 'b': 150}
            }
        }

        # Distribution plots for numeric columns
        distribution_plots = {}
        for col in numeric_cols:
            data_col = data[col].dropna()
            if len(data_col) > 0:
                # Create histogram with KDE
                hist_values, bin_edges = np.histogram(data_col, bins='auto', density=True)
                bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2

                # Calculate KDE
                kde = gaussian_kde(data_col)
                x_range = np.linspace(min(data_col), max(data_col), 100)
                kde_values = kde(x_range)

                distribution_plots[col] = {
                    'data': [
                        {
                            'type': 'histogram',
                            'x': data_col.tolist(),
                            'name': 'Histogram',
                            'histnorm': 'probability density',
                            'opacity': 0.7
                        },
                        {
                            'type': 'scatter',
                            'x': x_range.tolist(),
                            'y': kde_values.tolist(),
                            'name': 'KDE',
                            'line': {'color': 'red'}
                        }
                    ],
                    'layout': {
                        'title': f'Distribution of {col}',
                        'xaxis': {'title': col},
                        'yaxis': {'title': 'Density'},
                        'showlegend': True,
                        'bargap': 0.1
                    }
                }

        # Box plots for numeric columns
        box_plots = {
            'data': [
                {
                    'type': 'box',
                    'y': data[col].dropna().tolist(),
                    'name': col,
                    'boxpoints': 'outliers'
                } for col in numeric_cols
            ],
            'layout': {
                'title': 'Box Plots of Numeric Features',
                'yaxis': {'title': 'Value'},
                'showlegend': False,
                'height': max(400, len(numeric_cols) * 50)
            }
        }

        # Bar plots for categorical columns
        categorical_plots = {}
        for col in categorical_cols:
            value_counts = data[col].value_counts()
            categorical_plots[col] = {
                'data': [{
                    'type': 'bar',
                    'x': value_counts.index.tolist(),
                    'y': value_counts.values.tolist(),
                    'marker': {'color': 'rgb(79, 70, 229)'}
                }],
                'layout': {
                    'title': f'Distribution of {col}',
                    'xaxis': {'title': col, 'tickangle': 45},
                    'yaxis': {'title': 'Count'},
                    'margin': {'b': 100}
                }
            }

        return jsonify({
            'status': 'success',
            'numeric_stats': numeric_stats,
            'correlation_plot': correlation_plot,
            'distribution_plots': distribution_plots,
            'box_plots': box_plots,
            'categorical_plots': categorical_plots
        })

    except Exception as e:
        app.logger.error(f"Error in advanced_eda: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/post_eda', methods=['GET'])
def post_eda():
    """Perform EDA on preprocessed data"""
    try:
        if not ml_processor:
            return jsonify({
                'status': 'error',
                'message': 'Please upload or select a dataset first'
            })
        
        if not hasattr(ml_processor, 'X_train') or not hasattr(ml_processor, 'y_train'):
            return jsonify({
                'status': 'error',
                'message': 'Please preprocess the data first'
            })
            
        # Get feature correlations
        correlations = {}
        if ml_processor.X_train.select_dtypes(include=['int64', 'float64']).columns.size > 0:
            corr_matrix = ml_processor.X_train.corr()
            correlations = {
                'matrix': corr_matrix.to_dict(),
                'features': corr_matrix.columns.tolist()
            }
        
        # Get feature importance if classification
        feature_importance = None
        if ml_processor.problem_type == 'classification':
            from sklearn.ensemble import RandomForestClassifier
            rf = RandomForestClassifier(n_estimators=50, random_state=42)
            rf.fit(ml_processor.X_train, ml_processor.y_train)
            importance = rf.feature_importances_
            feature_importance = {
                str(col): float(imp) for col, imp in 
                zip(ml_processor.X_train.columns, importance)
            }
        
        # Get distribution plots for numerical features
        distributions = {}
        numerical_features = ml_processor.X_train.select_dtypes(include=['int64', 'float64']).columns
        for col in numerical_features:
            train_data = ml_processor.X_train[col].tolist()
            test_data = ml_processor.X_test[col].tolist()
            distributions[str(col)] = {
                'train': {
                    'mean': float(np.mean(train_data)),
                    'std': float(np.std(train_data)),
                    'min': float(np.min(train_data)),
                    'max': float(np.max(train_data)),
                    'data': train_data[:1000]  # Limit data points for visualization
                },
                'test': {
                    'mean': float(np.mean(test_data)),
                    'std': float(np.std(test_data)),
                    'min': float(np.min(test_data)),
                    'max': float(np.max(test_data)),
                    'data': test_data[:1000]  # Limit data points for visualization
                }
            }
        
        # Get target distribution
        target_distribution = None
        if ml_processor.problem_type == 'classification':
            train_dist = pd.Series(ml_processor.y_train).value_counts(normalize=True)
            test_dist = pd.Series(ml_processor.y_test).value_counts(normalize=True)
            target_distribution = {
                'train': {str(k): float(v) for k, v in train_dist.items()},
                'test': {str(k): float(v) for k, v in test_dist.items()}
            }
        else:
            target_distribution = {
                'train': {
                    'mean': float(np.mean(ml_processor.y_train)),
                    'std': float(np.std(ml_processor.y_train)),
                    'min': float(np.min(ml_processor.y_train)),
                    'max': float(np.max(ml_processor.y_train)),
                    'data': ml_processor.y_train[:1000].tolist()
                },
                'test': {
                    'mean': float(np.mean(ml_processor.y_test)),
                    'std': float(np.std(ml_processor.y_test)),
                    'min': float(np.min(ml_processor.y_test)),
                    'max': float(np.max(ml_processor.y_test)),
                    'data': ml_processor.y_test[:1000].tolist()
                }
            }
        
        return jsonify({
            'status': 'success',
            'eda_results': {
                'correlations': correlations,
                'feature_importance': feature_importance,
                'distributions': distributions,
                'target_distribution': target_distribution,
                'problem_type': ml_processor.problem_type
            }
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/perform_eda', methods=['POST'])
def perform_eda():
    try:
        if not ml_processor:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload data first.'
            })
            
        # Perform EDA
        eda_results = ml_processor.perform_eda()
        
        # Convert numpy values to native Python types for JSON serialization
        def convert_to_serializable(obj):
            if isinstance(obj, (np.int_, np.intc, np.intp, np.int8, np.int16, np.int32, 
                              np.int64, np.uint8, np.uint16, np.uint32, np.uint64)):
                return int(obj)
            elif isinstance(obj, (np.float_, np.float16, np.float32, np.float64)):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            return obj
        
        # Process the results to ensure they're JSON serializable
        processed_results = {
            k: convert_to_serializable(v) if isinstance(v, (np.generic, np.ndarray)) else v 
            for k, v in eda_results.items()
        }
        
        return jsonify(processed_results)
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/preprocess_data', methods=['POST'])
def preprocess_data():
    try:
        if not ml_processor:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload data first.'
            })
            
        # Preprocess the data
        preprocessing_results = ml_processor.preprocess_data()
        
        # Convert numpy values to native Python types
        def convert_to_serializable(obj):
            if isinstance(obj, (np.int_, np.intc, np.intp, np.int8, np.int16, np.int32, 
                              np.int64, np.uint8, np.uint16, np.uint32, np.uint64)):
                return int(obj)
            elif isinstance(obj, (np.float_, np.float16, np.float32, np.float64)):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            return obj
        
        # Process the results to ensure they're JSON serializable
        processed_results = {
            k: convert_to_serializable(v) if isinstance(v, (np.generic, np.ndarray)) else v 
            for k, v in preprocessing_results.items()
        }
        
        return jsonify(processed_results)
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/set_target', methods=['POST'])
def set_target():
    try:
        if not ml_processor:
            return jsonify({
                'status': 'error',
                'message': 'Please upload or select a dataset first'
            })

        data = request.get_json()
        target_column = data.get('target_column')
        
        if not target_column:
            return jsonify({
                'status': 'error',
                'message': 'Target column not specified'
            })

        # Set target column in MLProcessor
        ml_processor.set_target(target_column)

        # Get problem type and basic target analysis
        target_data = ml_processor.data[target_column]
        
        target_analysis = {
            'type': ml_processor.problem_type,
            'unique_values': int(target_data.nunique()),
            'missing_values': int(target_data.isnull().sum())
        }

        # For classification, add class distribution
        if ml_processor.problem_type == 'classification':
            class_dist = target_data.value_counts().to_dict()
            target_analysis['class_distribution'] = {str(k): int(v) for k, v in class_dist.items()}

        return jsonify({
            'status': 'success',
            'problem_type': ml_processor.problem_type,
            'target_analysis': target_analysis
        })

    except Exception as e:
        app.logger.error(f"Error in set_target: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/compare_models', methods=['POST'])
def compare_models():
    try:
        if not ml_processor:
            return jsonify({
                'status': 'error',
                'message': 'Please upload or select a dataset first'
            })

        data = request.get_json()
        model_types = data.get('model_types', None)  # If None, compare all trained models
        
        app.logger.info(f"Comparing models: {model_types}")
        
        try:
            # Get model comparison
            comparison = ml_processor.get_model_comparison(model_types)
            
            # Create comparison plots
            plots = create_comparison_plots(comparison)
            
            return jsonify({
                'status': 'success',
                'comparison': comparison,
                'plots': plots
            })
        except ValueError as ve:
            return jsonify({
                'status': 'error',
                'message': str(ve)
            })
        
    except Exception as e:
        app.logger.error(f"Error in compare_models: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

def create_comparison_plots(comparison):
    """Create comparison plots for multiple models."""
    try:
        plots = []
        
        # Extract metrics for all models
        metrics_data = {
            model_name: model_info['metrics'] 
            for model_name, model_info in comparison.items()
        }
        
        # Create bar plot for each metric
        common_metrics = set.intersection(*[set(model['metrics'].keys()) for model in comparison.values()])
        
        for metric in common_metrics:
            metric_values = {
                model_name: metrics[metric]
                for model_name, metrics in metrics_data.items()
            }
            
            fig = go.Figure(data=[
                go.Bar(
                    x=list(metric_values.keys()),
                    y=list(metric_values.values()),
                    text=[f"{v:.4f}" for v in metric_values.values()],
                    textposition='auto',
                )
            ])
            
            fig.update_layout(
                title=f"Model Comparison - {metric.upper()}",
                xaxis_title="Model",
                yaxis_title=metric.upper(),
                template="plotly_white"
            )
            
            plots.append({
                'type': 'bar',
                'metric': metric,
                'data': fig.to_json()
            })
            
        return plots
        
    except Exception as e:
        app.logger.error(f"Error creating comparison plots: {str(e)}")
        return []

@app.route('/available_datasets')
def available_datasets():
    try:
        datasets = {
            'iris': {
                'name': 'Iris Dataset',
                'description': 'Classic flower classification dataset',
                'type': 'Classification',
                'features': 4,
                'samples': 150
            },
            'california': {
                'name': 'California Housing',
                'description': 'House price prediction dataset',
                'type': 'Regression',
                'features': 8,
                'samples': 20640
            },
            'diabetes': {
                'name': 'Diabetes Dataset',
                'description': 'Disease progression prediction',
                'type': 'Regression',
                'features': 10,
                'samples': 442
            },
            'breast_cancer': {
                'name': 'Breast Cancer Dataset',
                'description': 'Cancer diagnosis classification',
                'type': 'Classification',
                'features': 30,
                'samples': 569
            },
            'wine': {
                'name': 'Wine Dataset',
                'description': 'Wine variety classification',
                'type': 'Classification',
                'features': 13,
                'samples': 178
            }
        }
        return jsonify({
            'status': 'success',
            'datasets': datasets
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

# New Business Intelligence Routes
@app.route('/business_insights', methods=['GET'])
def get_business_insights():
    """Get automated business insights"""
    global business_intelligence
    
    try:
        if business_intelligence is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        # Analyze business metrics
        insights = business_intelligence.analyze_business_metrics()
        
        return jsonify({
            'status': 'success',
            'insights': insights
        })
        
    except Exception as e:
        app.logger.error(f"Error generating business insights: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error generating insights: {str(e)}"
        })

@app.route('/dashboard_data', methods=['GET'])
def get_dashboard_data():
    """Get dashboard data for business intelligence"""
    global business_intelligence
    
    try:
        if business_intelligence is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        # Generate dashboard data
        dashboard_data = business_intelligence.generate_dashboard_data()
        
        return jsonify({
            'status': 'success',
            'dashboard_data': dashboard_data
        })
        
    except Exception as e:
        app.logger.error(f"Error generating dashboard data: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error generating dashboard data: {str(e)}"
        })

@app.route('/generate_report', methods=['POST'])
def generate_report():
    """Generate business report"""
    global business_reporter
    
    try:
        if business_reporter is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        data = request.get_json()
        report_type = data.get('report_type', 'executive')
        
        if report_type == 'executive':
            report = business_reporter.generate_executive_summary()
        else:
            report = business_reporter.generate_detailed_report()
        
        # Save report
        filepath = business_reporter.save_report(report)
        
        return jsonify({
            'status': 'success',
            'message': f'{report_type.title()} report generated successfully',
            'report': report,
            'filepath': filepath
        })
        
    except Exception as e:
        app.logger.error(f"Error generating report: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error generating report: {str(e)}"
        })

@app.route('/email_report', methods=['POST'])
def email_report():
    """Generate email report content"""
    global business_reporter
    
    try:
        if business_reporter is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        data = request.get_json()
        report_type = data.get('report_type', 'executive')
        recipient_email = data.get('email', '')
        
        # Generate email content
        email_content = business_reporter.generate_email_content(report_type)
        
        return jsonify({
            'status': 'success',
            'message': 'Email report content generated successfully',
            'email_content': email_content,
            'recipient_email': recipient_email
        })
        
    except Exception as e:
        app.logger.error(f"Error generating email report: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error generating email report: {str(e)}"
        })

@app.route('/business_recommendations', methods=['GET'])
def get_business_recommendations():
    """Get business recommendations"""
    global business_intelligence
    
    try:
        if business_intelligence is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        # Ensure insights are generated
        if not business_intelligence.insights:
            business_intelligence.analyze_business_metrics()
        
        recommendations = business_intelligence.recommendations
        
        return jsonify({
            'status': 'success',
            'recommendations': recommendations
        })
        
    except Exception as e:
        app.logger.error(f"Error getting recommendations: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error getting recommendations: {str(e)}"
        })

@app.route('/anomaly_analysis', methods=['GET'])
def get_anomaly_analysis():
    """Get detailed anomaly analysis"""
    global business_intelligence
    
    try:
        if business_intelligence is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        # Ensure insights are generated
        if not business_intelligence.insights:
            business_intelligence.analyze_business_metrics()
        
        anomalies = business_intelligence.insights.get('anomaly_detection', {})
        
        return jsonify({
            'status': 'success',
            'anomalies': anomalies
        })
        
    except Exception as e:
        app.logger.error(f"Error getting anomaly analysis: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error getting anomaly analysis: {str(e)}"
        })

@app.route('/trend_analysis', methods=['GET'])
def get_trend_analysis():
    """Get trend analysis"""
    global business_intelligence
    
    try:
        if business_intelligence is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        # Ensure insights are generated
        if not business_intelligence.insights:
            business_intelligence.analyze_business_metrics()
        
        trends = business_intelligence.insights.get('trend_analysis', {})
        
        return jsonify({
            'status': 'success',
            'trends': trends
        })
        
    except Exception as e:
        app.logger.error(f"Error getting trend analysis: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error getting trend analysis: {str(e)}"
        })

@app.route('/dashboard')
def business_dashboard():
    """Business Intelligence Dashboard"""
    return render_template('business_dashboard.html')

@app.route('/ai-dashboard')
def ai_dashboard():
    """AI-Powered Business Intelligence Dashboard"""
    return render_template('ai_dashboard.html')

@app.route('/ai-dashboard-new')
def ai_dashboard_new():
    """Modern AI-Powered Business Intelligence Dashboard"""
    return render_template('ai_dashboard_new.html')

@app.route('/data-trends')
def data_trends():
    return render_template('data_trends.html')

@app.route('/data_trends_summary', methods=['GET'])
def data_trends_summary():
    """Return real visualization data for the currently uploaded dataset.
    Uses the dataset loaded by /upload (ml_processor.data)."""
    global ml_processor
    try:
        if ml_processor is None or ml_processor.data is None:
            return jsonify({'status': 'error', 'message': 'No dataset uploaded yet.'})

        df: pd.DataFrame = ml_processor.data.copy()

        # Identify columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

        # Scatter: first 2 numeric columns (sample up to 1000 points)
        scatter = None
        if len(numeric_cols) >= 2:
            x_name, y_name = numeric_cols[0], numeric_cols[1]
            sample_df = df[[x_name, y_name]].dropna().head(1000)
            scatter = {
                'xName': x_name,
                'yName': y_name,
                'x': sample_df[x_name].astype(float).tolist(),
                'y': sample_df[y_name].astype(float).tolist(),
            }

        # Bar/Donut: use first categorical; if none, bucket first numeric into quantiles
        bar = donut = None
        if len(categorical_cols) > 0:
            cat = categorical_cols[0]
            counts = df[cat].astype(str).value_counts().head(10)
            labels = counts.index.tolist()
            values = counts.values.tolist()
            bar = {'labels': labels, 'values': values}
            donut = {'labels': labels, 'values': values}
        elif len(numeric_cols) > 0:
            num = numeric_cols[0]
            series = pd.qcut(df[num].dropna(), q=5, duplicates='drop')
            counts = series.value_counts().sort_index()
            labels = [str(i) for i in counts.index.astype(str).tolist()]
            values = counts.values.tolist()
            bar = {'labels': labels, 'values': values}
            donut = {'labels': labels, 'values': values}

        # Correlation matrix for numeric columns
        corr = None
        if len(numeric_cols) >= 2:
            c = df[numeric_cols].corr().fillna(0)
            corr = {
                'labels': numeric_cols,
                'z': c.values.tolist(),
            }

        # Radar: normalized means for up to 6 numeric columns (by variance)
        radar = None
        if len(numeric_cols) >= 3:
            # Choose up to 6 columns with highest variance
            var_series = df[numeric_cols].var().sort_values(ascending=False)
            chosen = var_series.head(6).index.tolist()
            axes = chosen
            r_vals = []
            for col in chosen:
                col_series = df[col].dropna()
                if col_series.empty:
                    r_vals.append(0)
                    continue
                col_min, col_max = float(col_series.min()), float(col_series.max())
                col_mean = float(col_series.mean())
                if col_max == col_min:
                    r_vals.append(50)
                else:
                    r_vals.append((col_mean - col_min) / (col_max - col_min) * 100.0)
            radar = {'axes': axes, 'series': [{'name': 'Mean (normalized)', 'r': r_vals}]}

        return jsonify({
            'status': 'success',
            'numeric_columns': numeric_cols,
            'categorical_columns': categorical_cols,
            'plots': {
                'scatter': scatter,
                'bar': bar,
                'donut': donut,
                'corr': corr,
                'radar': radar,
            }
        })
    except Exception as e:
        app.logger.error(f"data_trends_summary error: {e}")
        return jsonify({'status': 'error', 'message': str(e)})

# ----------------------------
# Generic REST-style APIs
# ----------------------------

def _ensure_dataset_loaded():
    global ml_processor
    if ml_processor is None or ml_processor.data is None:
        return None, jsonify({'status': 'error', 'message': 'No dataset uploaded. Use /upload first.'})
    return ml_processor.data, None

@app.route('/api/dataset', methods=['GET'])
def api_dataset_info():
    """Return dataset meta: columns, dtypes, shapes, numeric/categorical lists."""
    df, err = _ensure_dataset_loaded()
    if err: return err
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    return jsonify({
        'status': 'success',
        'data': {
            'shape': [int(df.shape[0]), int(df.shape[1])],
            'columns': df.columns.tolist(),
            'dtypes': {c: str(t) for c, t in df.dtypes.items()},
            'numeric_columns': numeric_cols,
            'categorical_columns': categorical_cols,
        }
    })

@app.route('/api/visualize/scatter', methods=['GET'])
def api_vis_scatter():
    df, err = _ensure_dataset_loaded();
    if err: return err
    x = request.args.get('x')
    y = request.args.get('y')
    sample = int(request.args.get('sample', 1000))
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if not x or not y:
        if len(numeric_cols) < 2:
            return jsonify({'status':'error','message':'Need at least two numeric columns or specify x & y'})
        x, y = numeric_cols[0], numeric_cols[1]
    if x not in df.columns or y not in df.columns:
        return jsonify({'status':'error','message':'Invalid x or y column'})
    sample_df = df[[x, y]].dropna().head(sample)
    return jsonify({'status':'success','data': {'xName': x, 'yName': y, 'x': sample_df[x].astype(float).tolist(), 'y': sample_df[y].astype(float).tolist()}})

@app.route('/api/visualize/bar', methods=['GET'])
def api_vis_bar():
    df, err = _ensure_dataset_loaded();
    if err: return err
    column = request.args.get('column')
    bins = int(request.args.get('bins', 5))
    if column and column not in df.columns:
        return jsonify({'status':'error','message':'Invalid column'})
    if column is None:
        categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
        if categorical_cols:
            column = categorical_cols[0]
        else:
            # numeric fallback: histogram bins
            num = df.select_dtypes(include=[np.number]).columns.tolist()
            if not num:
                return jsonify({'status':'error','message':'No suitable columns for bar chart'})
            series = pd.qcut(df[num[0]].dropna(), q=bins, duplicates='drop')
            counts = series.value_counts().sort_index()
            return jsonify({'status':'success','data': {'labels': [str(i) for i in counts.index.astype(str).tolist()], 'values': counts.values.tolist(), 'numeric_binned': True}})
    counts = df[column].astype(str).value_counts().head(20)
    return jsonify({'status':'success','data': {'labels': counts.index.tolist(), 'values': counts.values.tolist(), 'column': column}})

@app.route('/api/visualize/donut', methods=['GET'])
def api_vis_donut():
    # Same data as bar; client renders donut
    return api_vis_bar()

@app.route('/api/visualize/correlation', methods=['GET'])
def api_vis_corr():
    df, err = _ensure_dataset_loaded();
    if err: return err
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if len(numeric_cols) < 2:
        return jsonify({'status':'error','message':'Need at least two numeric columns for correlation matrix'})
    c = df[numeric_cols].corr().fillna(0)
    return jsonify({'status':'success','data': {'labels': numeric_cols, 'z': c.values.tolist()}})

@app.route('/api/visualize/radar', methods=['GET'])
def api_vis_radar():
    df, err = _ensure_dataset_loaded();
    if err: return err
    cols = request.args.get('columns')
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    chosen = None
    if cols:
        chosen = [c for c in cols.split(',') if c in numeric_cols]
    if not chosen:
        var_series = df[numeric_cols].var().sort_values(ascending=False)
        chosen = var_series.head(6).index.tolist()
    axes = chosen
    r_vals = []
    for col in chosen:
        col_series = df[col].dropna()
        if col_series.empty:
            r_vals.append(0)
            continue
        col_min, col_max = float(col_series.min()), float(col_series.max())
        col_mean = float(col_series.mean())
        r_vals.append(50 if col_max == col_min else (col_mean - col_min) / (col_max - col_min) * 100.0)
    return jsonify({'status':'success','data': {'axes': axes, 'series': [{'name':'Mean (normalized)','r': r_vals}]}})

# ----------------------------
# Scheduling calendar APIs
# ----------------------------

# Store schedules as JSON in uploads/schedules.json
SCHEDULES_FILE = os.path.join(app.config['UPLOAD_FOLDER'], 'schedules.json')

def _load_schedules():
    try:
        if not os.path.exists(SCHEDULES_FILE):
            return []
        with open(SCHEDULES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def _save_schedules(items):
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    with open(SCHEDULES_FILE, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

@app.route('/api/calendar/events', methods=['GET'])
def api_calendar_events():
    """List events. Accepts either start/end (YYYY-MM-DD) or month/year."""
    try:
        items = _load_schedules()
        start_str = request.args.get('start')
        end_str = request.args.get('end')
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)

        if month and year:
            start_dt = date(year, month, 1)
            # Compute last day of month
            next_month = (start_dt.replace(day=28) + timedelta(days=4))
            end_dt = next_month - timedelta(days=next_month.day)
        else:
            # Default to current month if not provided
            if start_str:
                start_dt = datetime.strptime(start_str, '%Y-%m-%d').date()
            else:
                today = date.today()
                start_dt = today.replace(day=1)
            if end_str:
                end_dt = datetime.strptime(end_str, '%Y-%m-%d').date()
            else:
                nm = (start_dt.replace(day=28) + timedelta(days=4)).replace(day=1)
                end_dt = nm - timedelta(days=1)

        def overlaps(ev):
            try:
                ev_start = datetime.strptime(ev['start_date'], '%Y-%m-%d').date()
                ev_end = datetime.strptime(ev.get('end_date', ev['start_date']), '%Y-%m-%d').date()
                return ev_start <= end_dt and ev_end >= start_dt
            except Exception:
                return False

        filtered = [ev for ev in items if overlaps(ev)]
        return jsonify({'status': 'success', 'events': filtered, 'range': {'start': start_dt.isoformat(), 'end': end_dt.isoformat()}})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/calendar/event', methods=['POST'])
def api_calendar_add_event():
    try:
        payload = request.get_json(force=True) or {}
        title = (payload.get('title') or '').strip()
        start_date_str = payload.get('start_date')
        end_date_str = payload.get('end_date') or start_date_str
        color = payload.get('color') or '#2563eb'
        description = payload.get('description') or ''

        if not title or not start_date_str:
            return jsonify({'status': 'error', 'message': 'title and start_date are required'}), 400

        # Validate dates
        _ = datetime.strptime(start_date_str, '%Y-%m-%d')
        _ = datetime.strptime(end_date_str, '%Y-%m-%d')

        items = _load_schedules()
        event_id = str(uuid.uuid4())
        event = {
            'id': event_id,
            'title': title,
            'start_date': start_date_str,
            'end_date': end_date_str,
            'color': color,
            'description': description
        }
        items.append(event)
        _save_schedules(items)
        return jsonify({'status': 'success', 'event': event})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/calendar/event/<event_id>', methods=['DELETE'])
def api_calendar_delete_event(event_id):
    try:
        items = _load_schedules()
        new_items = [ev for ev in items if ev.get('id') != event_id]
        _save_schedules(new_items)
        return jsonify({'status': 'success', 'deleted': event_id})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ----------------------------
# News APIs (RSS aggregator)
# ----------------------------

def _news_sources(kind: str):
    kind = (kind or 'all').lower()
    business = [
        'https://feeds.reuters.com/reuters/businessNews',
        'https://feeds.bbci.co.uk/news/business/rss.xml',
        'https://news.google.com/rss/search?q=business&hl=en&gl=US&ceid=US:en',
    ]
    india = [
        'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
        'https://news.google.com/rss/search?q=India%20business&hl=en-IN&gl=IN&ceid=IN:en',
    ]
    world = [
        'https://feeds.reuters.com/reuters/worldNews',
        'https://feeds.bbci.co.uk/news/world/rss.xml',
        'https://news.google.com/rss?hl=en&gl=US&ceid=US:en',
    ]

    if kind == 'business':
        return business
    if kind == 'india':
        return india
    if kind == 'world':
        return world
    # all
    return business + india + world

def _parse_rss(xml_text: str):
    try:
        root = ET.fromstring(xml_text)
        # RSS 2.0: channel/item
        channel = root.find('channel')
        if channel is None:
            # Some feeds use namespaces; try to find all items regardless
            items = root.findall('.//item')
        else:
            items = channel.findall('item')
        ns = {
            'media': 'http://search.yahoo.com/mrss/',
            'content': 'http://purl.org/rss/1.0/modules/content/'
        }
        parsed = []
        for it in items:
            def txt(tag):
                el = it.find(tag)
                return el.text.strip() if el is not None and el.text else ''
            title = txt('title')
            link = txt('link')
            desc = txt('description')
            pub_raw = txt('pubDate') or txt('pubdate')
            try:
                published = parsedate_to_datetime(pub_raw).isoformat() if pub_raw else None
            except Exception:
                published = None
            # Extract image
            image = None
            # enclosure tag
            enc = it.find('enclosure')
            if enc is not None and (enc.attrib.get('type', '').startswith('image/') or enc.attrib.get('url')):
                image = enc.attrib.get('url')
            # media:content
            if not image:
                mc = it.find('media:content', ns)
                if mc is not None and mc.attrib.get('url'):
                    image = mc.attrib.get('url')
            # media:thumbnail
            if not image:
                mt = it.find('media:thumbnail', ns)
                if mt is not None and mt.attrib.get('url'):
                    image = mt.attrib.get('url')
            # content:encoded (HTML with <img>)
            if not image:
                ce = it.find('content:encoded', ns)
                if ce is not None and ce.text:
                    m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', ce.text, flags=re.IGNORECASE)
                    if m:
                        image = m.group(1)
            # description HTML fallback
            if not image and desc:
                m2 = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', desc, flags=re.IGNORECASE)
                if m2:
                    image = m2.group(1)

            parsed.append({'title': title, 'link': link, 'description': desc, 'published': published, 'image': image})
        return parsed
    except Exception:
        return []

@app.route('/api/news', methods=['GET'])
def api_news():
    """Aggregate news from free RSS feeds. Query params:
    - type: business | india | world | all (default all)
    - limit: number of items (default 20)
    """
    kind = request.args.get('type', 'all')
    limit = int(request.args.get('limit', 20))
    # Prefer header/query key for provider, else config
    provider_key = request.headers.get('X-NEWS-API-KEY') or request.args.get('api_key') or app.config.get('NEWS_API_KEY')
    items = []

    # Use provider for world/india when key present; fallback to RSS otherwise
    def _provider_fetch(k: str, key: str):
        try:
            base = 'https://gnews.io/api/v4/top-headlines'
            if k.lower() == 'world':
                # World business headlines
                url = f"{base}?topic=business&lang=en&max=50&apikey={key}"
            elif k.lower() == 'india':
                # India-focused business headlines
                url = f"{base}?topic=business&lang=en&country=in&max=50&apikey={key}"
            else:
                return []
            r = requests.get(url, timeout=8)
            if r.status_code != 200:
                return []
            data = r.json()
            arts = data.get('articles', [])
            out = []
            for a in arts:
                out.append({
                    'title': a.get('title'),
                    'link': a.get('url'),
                    'description': a.get('description') or '',
                    'published': a.get('publishedAt'),
                    'image': a.get('image'),
                    'source': (a.get('source') or {}).get('name')
                })
            return out
        except Exception:
            return []

    if kind.lower() in ('world', 'india') and provider_key:
        items = _provider_fetch(kind, provider_key)
    else:
        srcs = _news_sources(kind)
        for url in srcs:
            try:
                resp = requests.get(url, timeout=8)
                if resp.status_code == 200 and resp.text:
                    feed_items = _parse_rss(resp.text)
                    host = urlparse(url).netloc
                    for fi in feed_items:
                        fi['source'] = host
                    items.extend(feed_items)
            except Exception:
                continue

    # Deduplicate by link/title
    def _dedupe(entries):
        seen_links, seen_titles = set(), set()
        unique = []
        for e in entries:
            link = (e.get('link') or '').strip()
            raw_title = (e.get('title') or '').strip().lower()
            # normalize title aggressively
            title = re.sub(r'[^a-z0-9]+', ' ', raw_title).strip()
            if link:
                try:
                    u = urlparse(link)
                    host = u.netloc.lower().replace('www.', '').replace('m.', '').replace('mobile.', '').replace('amp.', '')
                    path = u.path.rstrip('/').lower()
                    link_key = (host + path)
                except Exception:
                    link_key = link.lower()
            else:
                link_key = ''
            if (link_key and link_key in seen_links) or (not link_key and title in seen_titles):
                continue
            if link_key:
                seen_links.add(link_key)
            if title:
                seen_titles.add(title)
            unique.append(e)
        return unique
    items = _dedupe(items)
    for url in srcs:
        try:
            resp = requests.get(url, timeout=8)
            if resp.status_code == 200 and resp.text:
                feed_items = _parse_rss(resp.text)
                host = urlparse(url).netloc
                for fi in feed_items:
                    fi['source'] = host
                items.extend(feed_items)
        except Exception:
            continue
    # If business-only, filter to business-related keywords to remove noise
    # Apply business-only filter for business and india (and optionally world to keep it relevant)
    if kind.lower() in ('business', 'india'):
        keywords = [
            'business', 'market', 'markets', 'economy', 'economic', 'finance', 'financial', 'stock', 'stocks',
            'share', 'shares', 'ipo', 'startup', 'corporate', 'earnings', 'revenue', 'sales', 'profit', 'loss',
            'merger', 'acquisition', 'm&a', 'manufacturing', 'industry', 'export', 'import', 'inflation', 'gdp',
            'funding', 'valuation', 'tax', 'bank', 'interest rate', 'bond', 'commodity', 'crypto', 'bitcoin'
        ]
        blacklist = ['redeem', 'free fire', 'coupon', 'voucher', 'giveaway', 'lottery', 'match', 'live score']
        def is_business(entry):
            t = (entry.get('title') or '').lower()
            d = (entry.get('description') or '').lower()
            if any(b in t or b in d for b in blacklist):
                return False
            return any(k in t or k in d for k in keywords)
        items = [it for it in items if is_business(it)]

    # Additional India-focused filtering to avoid non-India items
    if kind.lower() == 'india':
        india_terms = [
            ' india ', ' indian ', 'new delhi', 'delhi', 'mumbai', 'bengaluru', 'bangalore', 'kolkata', 'chennai', 'hyderabad',
            'pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'goa', 'kerala', 'karnataka',
            'tamil nadu', 'telangana', 'andhra', 'maharashtra', 'uttar pradesh', 'gujarat', 'odisha', 'punjab', 'haryana'
        ]
        india_domains = [
            'timesofindia', 'indiatoday', 'thehindu', 'hindustantimes', 'indianexpress', 'livemint', 'business-standard',
            'economictimes', 'moneycontrol', 'news18', 'cnbctv18', 'mint', 'toi'
        ]
        def is_india(e):
            t = ' ' + (e.get('title') or '').lower() + ' '
            d = ' ' + (e.get('description') or '').lower() + ' '
            if any(term in t or term in d for term in india_terms):
                return True
            link = e.get('link') or ''
            try:
                host = urlparse(link).netloc.lower()
            except Exception:
                host = ''
            return host.endswith('.in') or any(dom in host for dom in india_domains)
        filtered = [e for e in items if is_india(e)]
        # Fallback: if too few after filtering, keep originals
        if len(filtered) >= 5:
            items = filtered

    # Ensure thumbnails: fetch OpenGraph image if missing (best-effort for first 10)
    def fetch_og_image(url: str):
        try:
            r = requests.get(url, timeout=4)
            if r.status_code == 200:
                m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', r.text, flags=re.IGNORECASE)
                if not m:
                    m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', r.text, flags=re.IGNORECASE)
                if m:
                    return m.group(1)
        except Exception:
            return None
        return None
    # Ensure thumbnails for first N items (all kinds)
    checked = 0
    for it in items:
        if not it.get('image') and it.get('link') and checked < 15:
            og = fetch_og_image(it['link'])
            if og:
                it['image'] = og
            checked += 1

    # Sort by published desc when available
    def sort_key(x):
        try:
            return datetime.fromisoformat(x['published']) if x.get('published') else datetime.min
        except Exception:
            return datetime.min
    items.sort(key=sort_key, reverse=True)
    items = items[:limit]
    return jsonify({'status': 'success', 'type': kind, 'count': len(items), 'items': items})

@app.route('/api/gemini/status', methods=['GET'])
def api_gemini_status():
    global gemini_ai
    try:
        status = {
            'initialized': gemini_ai is not None,
            'api_available': getattr(gemini_ai, 'api_available', False),
        }
        if getattr(gemini_ai, 'model', None):
            status['model'] = getattr(gemini_ai.model, 'model_name', 'unknown')
        return jsonify({'status': 'success', 'data': status})
    except Exception as e:
        return jsonify({'status':'error','message': str(e)})

# New Gemini AI Routes
@app.route('/gemini_analysis', methods=['POST'])
def gemini_analysis():
    """Get Gemini AI-powered business analysis"""
    global gemini_ai, business_intelligence
    
    try:
        if gemini_ai is None:
            return jsonify({
                'status': 'error',
                'message': 'Gemini AI not available. Please set GEMINI_API_KEY environment variable.'
            })
        
        if business_intelligence is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        # Ensure insights are generated
        if not business_intelligence.insights:
            business_intelligence.analyze_business_metrics()
        
        data_summary = business_intelligence.insights['data_overview']
        insights = business_intelligence.insights
        
        # Get Gemini analysis
        analysis = gemini_ai.analyze_business_data(data_summary, insights)
        
        return jsonify({
            'status': 'success',
            'gemini_analysis': analysis
        })
        
    except Exception as e:
        app.logger.error(f"Error in Gemini analysis: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error in Gemini analysis: {str(e)}"
        })

@app.route('/gemini_executive_summary', methods=['POST'])
def gemini_executive_summary():
    """Generate Gemini AI-powered executive summary"""
    global gemini_ai, business_intelligence
    
    try:
        if gemini_ai is None:
            return jsonify({
                'status': 'error',
                'message': 'Gemini AI not available. Please set GEMINI_API_KEY environment variable.'
            })
        
        if business_intelligence is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        # Ensure insights are generated
        if not business_intelligence.insights:
            business_intelligence.analyze_business_metrics()
        
        business_data = business_intelligence.insights['data_overview']
        metrics = business_intelligence.insights['business_metrics']
        
        # Get Gemini executive summary
        summary = gemini_ai.generate_executive_summary(business_data, metrics)
        
        return jsonify({
            'status': 'success',
            'executive_summary': summary
        })
        
    except Exception as e:
        app.logger.error(f"Error generating Gemini executive summary: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error generating executive summary: {str(e)}"
        })

@app.route('/gemini_trends', methods=['POST'])
def gemini_trends():
    """Get Gemini AI-powered trend predictions"""
    global gemini_ai, business_intelligence
    
    try:
        if gemini_ai is None:
            return jsonify({
                'status': 'error',
                'message': 'Gemini AI not available. Please set GEMINI_API_KEY environment variable.'
            })
        
        if business_intelligence is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        # Ensure insights are generated
        if not business_intelligence.insights:
            business_intelligence.analyze_business_metrics()
        
        historical_data = business_intelligence.data.to_dict('records')[:100]  # Last 100 records
        current_metrics = business_intelligence.insights['business_metrics']
        
        # Get Gemini trend predictions
        predictions = gemini_ai.predict_business_trends(historical_data, current_metrics)
        
        return jsonify({
            'status': 'success',
            'trend_predictions': predictions
        })
        
    except Exception as e:
        app.logger.error(f"Error in Gemini trend predictions: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error in trend predictions: {str(e)}"
        })

@app.route('/gemini_recommendations', methods=['POST'])
def gemini_recommendations():
    """Get Gemini AI-powered recommendations"""
    global gemini_ai, business_intelligence
    
    try:
        if gemini_ai is None:
            return jsonify({
                'status': 'error',
                'message': 'Gemini AI not available. Please set GEMINI_API_KEY environment variable.'
            })
        
        if business_intelligence is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        data = request.get_json()
        industry_context = data.get('industry_context', 'General Business')
        
        # Ensure insights are generated
        if not business_intelligence.insights:
            business_intelligence.analyze_business_metrics()
        
        business_insights = business_intelligence.insights
        
        # Get Gemini recommendations
        recommendations = gemini_ai.generate_ai_recommendations(business_insights, industry_context)
        
        return jsonify({
            'status': 'success',
            'ai_recommendations': recommendations
        })
        
    except Exception as e:
        app.logger.error(f"Error in Gemini recommendations: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error in recommendations: {str(e)}"
        })

@app.route('/gemini_report', methods=['POST'])
def gemini_report():
    """Generate Gemini AI-powered report"""
    global gemini_ai, business_intelligence
    
    try:
        if gemini_ai is None:
            return jsonify({
                'status': 'error',
                'message': 'Gemini AI not available. Please set GEMINI_API_KEY environment variable.'
            })
        
        if business_intelligence is None:
            return jsonify({
                'status': 'error',
                'message': 'No data loaded. Please upload a dataset first.'
            })
        
        data = request.get_json()
        report_type = data.get('report_type', 'executive')
        
        # Ensure insights are generated
        if not business_intelligence.insights:
            business_intelligence.analyze_business_metrics()
        
        business_data = business_intelligence.insights
        insights = business_intelligence.recommendations
        
        # Get Gemini report
        report = gemini_ai.create_ai_powered_report(report_type, business_data, insights)
        
        return jsonify({
            'status': 'success',
            'ai_report': report
        })
        
    except Exception as e:
        app.logger.error(f"Error generating Gemini report: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error generating report: {str(e)}"
        })

@app.route('/comprehensive_ai_analysis', methods=['POST'])
def comprehensive_ai_analysis():
    """Comprehensive AI analysis of uploaded data - fully automated"""
    global most_recent_uploaded_file
    
    try:
        # Get the uploaded file
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file uploaded'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No file selected'})
        
        if file and allowed_file(file.filename):
            # Save and load the file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Update global variable
            most_recent_uploaded_file = filepath
            print(f"📁 File uploaded and tracked: {filename}")
            
            # Load data
            data = pd.read_csv(filepath)
            
            # Initialize AI and Business Intelligence
            gemini = GeminiAI("AIzaSyCLxCR0_HOX-abVRWhWdIlRqujwxEaupvk")
            bi = BusinessIntelligence(data)
            
            # Run comprehensive analysis
            print("🤖 Starting Comprehensive AI Analysis...")
            
            # 1. Business Intelligence Analysis
            print("📊 Running Business Intelligence...")
            bi.analyze_business_metrics()
            
            # 2. AI Business Analysis
            print("🧠 Running AI Business Analysis...")
            ai_analysis = gemini.analyze_business_data(bi.insights['data_overview'], bi.insights)
            
            # 3. AI Executive Summary
            print("📋 Generating AI Executive Summary...")
            executive_summary = gemini.generate_executive_summary(bi.insights['data_overview'], bi.insights.get('business_metrics', {}))
            
            # 4. AI Trend Predictions
            print("🔮 Generating AI Trend Predictions...")
            trend_predictions = gemini.predict_business_trends(bi.insights['data_overview'], bi.insights.get('business_metrics', {}))
            
            # 5. AI Recommendations for different industries
            print("💡 Generating AI Recommendations...")
            industry_recommendations = {}
            industries = ['General Business', 'Retail', 'Manufacturing', 'Finance']
            
            for industry in industries:
                recommendations = gemini.generate_ai_recommendations(bi.insights, industry)
                industry_recommendations[industry] = recommendations
            
            # 6. AI Report Generation
            print("📄 Generating AI Report...")
            ai_report = gemini.create_ai_powered_report('executive', bi.insights['data_overview'], bi.insights)
            
            # 7. Data Insights Summary
            print("📈 Creating Data Insights Summary...")
            data_insights = {
                'dataset_info': {
                    'filename': filename,
                    'total_records': len(data),
                    'total_columns': len(data.columns),
                    'columns': list(data.columns),
                    'data_types': data.dtypes.to_dict(),
                    'missing_values': data.isnull().sum().to_dict(),
                    'memory_usage': data.memory_usage(deep=True).sum()
                },
                'statistical_summary': {
                    'numeric_summary': data.describe().to_dict() if data.select_dtypes(include=[np.number]).shape[1] > 0 else {},
                    'categorical_summary': {col: data[col].value_counts().to_dict() for col in data.select_dtypes(include=['object']).columns} if data.select_dtypes(include=['object']).shape[1] > 0 else {}
                }
            }
            
            # Compile comprehensive results
            comprehensive_results = {
                'status': 'success',
                'timestamp': datetime.now().isoformat(),
                'filename': filename,
                'data_insights': convert_to_json_serializable(data_insights),
                'business_intelligence': convert_to_json_serializable(bi.insights),
                'ai_analysis': convert_to_json_serializable(ai_analysis),
                'executive_summary': convert_to_json_serializable(executive_summary),
                'trend_predictions': convert_to_json_serializable(trend_predictions),
                'industry_recommendations': convert_to_json_serializable(industry_recommendations),
                'ai_report': convert_to_json_serializable(ai_report),
                'analysis_summary': {
                    'total_analyses': 6,
                    'ai_features_used': [
                        'Business Intelligence Analysis',
                        'AI Business Analysis', 
                        'AI Executive Summary',
                        'AI Trend Predictions',
                        'AI Industry Recommendations',
                        'AI Report Generation'
                    ],
                    'industries_analyzed': industries,
                    'data_quality_score': _calculate_data_quality_score(data),
                    'ai_confidence_score': _calculate_ai_confidence_score(ai_analysis, executive_summary, trend_predictions)
                }
            }
            
            print("✅ Comprehensive AI Analysis Completed!")
            
            # Use json.dumps with custom encoder to ensure proper serialization
            try:
                json_str = json.dumps(comprehensive_results, cls=CustomJSONEncoder, default=str)
                return jsonify(comprehensive_results)
            except Exception as json_error:
                print(f"JSON serialization error: {json_error}")
                # Fallback: return a simplified response
                return jsonify({
                    'status': 'success',
                    'timestamp': datetime.now().isoformat(),
                    'filename': filename,
                    'message': 'Analysis completed successfully',
                    'analysis_summary': {
                        'total_analyses': 6,
                        'data_quality_score': _calculate_data_quality_score(data),
                        'ai_confidence_score': _calculate_ai_confidence_score(ai_analysis, executive_summary, trend_predictions)
                    }
                })
            
        else:
            return jsonify({'status': 'error', 'message': 'Invalid file type. Please upload a CSV file.'})
            
    except Exception as e:
        print(f"❌ Error in comprehensive AI analysis: {str(e)}")
        return jsonify({'status': 'error', 'message': f'Analysis failed: {str(e)}'})

def _calculate_data_quality_score(data):
    """Calculate data quality score based on various metrics"""
    try:
        total_cells = data.shape[0] * data.shape[1]
        missing_cells = data.isnull().sum().sum()
        completeness = (total_cells - missing_cells) / total_cells
        
        # Check for duplicates
        duplicate_ratio = data.duplicated().sum() / len(data)
        
        # Check data types variety
        type_variety = len(data.dtypes.unique()) / len(data.columns)
        
        # Overall quality score
        quality_score = (completeness * 0.6 + (1 - duplicate_ratio) * 0.3 + type_variety * 0.1) * 100
        
        return round(quality_score, 1)
    except:
        return 75.0

def _calculate_ai_confidence_score(ai_analysis, executive_summary, trend_predictions):
    """Calculate AI confidence score based on response quality"""
    try:
        scores = []
        
        # Check if responses are real AI or demo
        for response in [ai_analysis, executive_summary, trend_predictions]:
            if response.get('status') == 'success':
                scores.append(95)  # Real AI response
            else:
                scores.append(65)  # Demo response
        
        return round(sum(scores) / len(scores), 1)
    except:
        return 75.0

@app.route('/comprehensive-dashboard')
def comprehensive_dashboard():
    """Serve the comprehensive AI dashboard"""
    return render_template('comprehensive_ai_dashboard.html')

@app.route('/comprehensive_ai_analysis_existing', methods=['POST'])
def comprehensive_ai_analysis_existing():
    """Comprehensive AI analysis of already uploaded data - fully automated"""
    global most_recent_uploaded_file
    
    try:
        # Check if we have a tracked uploaded file
        if most_recent_uploaded_file and os.path.exists(most_recent_uploaded_file):
            filepath = most_recent_uploaded_file
            filename = os.path.basename(filepath)
            print(f"📁 Using most recently uploaded file: {filename}")
        else:
            # Fallback: Get the latest uploaded file from directory
            upload_folder = app.config['UPLOAD_FOLDER']
            csv_files = [f for f in os.listdir(upload_folder) if f.endswith('.csv')]
            
            if not csv_files:
                return jsonify({'status': 'error', 'message': 'No CSV files found. Please upload a file first.'})
            
            # Use the most recent file by modification time
            csv_files_with_time = []
            for f in csv_files:
                file_path = os.path.join(upload_folder, f)
                mod_time = os.path.getmtime(file_path)
                csv_files_with_time.append((f, mod_time))
            
            # Sort by modification time (most recent first)
            csv_files_with_time.sort(key=lambda x: x[1], reverse=True)
            filename = csv_files_with_time[0][0]
            filepath = os.path.join(upload_folder, filename)
            print(f"📁 Using most recently modified file: {filename}")
        
        # Load data
        data = pd.read_csv(filepath)
        print(f"📊 Loaded data: {len(data)} records, {len(data.columns)} columns")
        
        # Initialize AI and Business Intelligence
        gemini = GeminiAI("AIzaSyCLxCR0_HOX-abVRWhWdIlRqujwxEaupvk")
        bi = BusinessIntelligence(data)
        
        # Run comprehensive analysis
        print("🤖 Starting Comprehensive AI Analysis...")
        
        # 1. Business Intelligence Analysis
        print("📊 Running Business Intelligence...")
        bi.analyze_business_metrics()
        
        # 2. AI Business Analysis
        print("🧠 Running AI Business Analysis...")
        ai_analysis = gemini.analyze_business_data(bi.insights['data_overview'], bi.insights)
        
        # 3. AI Executive Summary
        print("📋 Generating AI Executive Summary...")
        executive_summary = gemini.generate_executive_summary(bi.insights['data_overview'], bi.insights.get('business_metrics', {}))
        
        # 4. AI Trend Predictions
        print("🔮 Generating AI Trend Predictions...")
        trend_predictions = gemini.predict_business_trends(bi.insights['data_overview'], bi.insights.get('business_metrics', {}))
        
        # 5. AI Recommendations for different industries
        print("💡 Generating AI Recommendations...")
        industry_recommendations = {}
        industries = ['General Business', 'Retail', 'Manufacturing', 'Finance']
        
        for industry in industries:
            recommendations = gemini.generate_ai_recommendations(bi.insights, industry)
            industry_recommendations[industry] = recommendations
        
        # 6. AI Report Generation
        print("📄 Generating AI Report...")
        ai_report = gemini.create_ai_powered_report('executive', bi.insights['data_overview'], bi.insights)
        
        # 7. Data Insights Summary
        print("📈 Creating Data Insights Summary...")
        data_insights = {
            'dataset_info': {
                'filename': filename,
                'total_records': len(data),
                'total_columns': len(data.columns),
                'columns': list(data.columns),
                'data_types': data.dtypes.to_dict(),
                'missing_values': data.isnull().sum().to_dict(),
                'memory_usage': data.memory_usage(deep=True).sum()
            },
            'statistical_summary': {
                'numeric_summary': data.describe().to_dict() if data.select_dtypes(include=[np.number]).shape[1] > 0 else {},
                'categorical_summary': {col: data[col].value_counts().to_dict() for col in data.select_dtypes(include=['object']).columns} if data.select_dtypes(include=['object']).shape[1] > 0 else {}
            }
        }
        
        # Compile comprehensive results
        comprehensive_results = {
            'status': 'success',
            'timestamp': datetime.now().isoformat(),
            'filename': filename,
            'data_insights': convert_to_json_serializable(data_insights),
            'business_intelligence': convert_to_json_serializable(bi.insights),
            'ai_analysis': convert_to_json_serializable(ai_analysis),
            'executive_summary': convert_to_json_serializable(executive_summary),
            'trend_predictions': convert_to_json_serializable(trend_predictions),
            'industry_recommendations': convert_to_json_serializable(industry_recommendations),
            'ai_report': convert_to_json_serializable(ai_report),
            'analysis_summary': {
                'total_analyses': 6,
                'ai_features_used': [
                    'Business Intelligence Analysis',
                    'AI Business Analysis', 
                    'AI Executive Summary',
                    'AI Trend Predictions',
                    'AI Industry Recommendations',
                    'AI Report Generation'
                ],
                'industries_analyzed': industries,
                'data_quality_score': _calculate_data_quality_score(data),
                'ai_confidence_score': _calculate_ai_confidence_score(ai_analysis, executive_summary, trend_predictions)
            }
        }
        
        print("✅ Comprehensive AI Analysis Completed!")
        return jsonify(comprehensive_results)
        
    except Exception as e:
        print(f"❌ Error in comprehensive AI analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': f'Analysis failed: {str(e)}'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
