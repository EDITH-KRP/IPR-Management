import os
from flask import Flask, render_template, redirect, url_for, flash, session, request, jsonify, send_from_directory
from flask_login import LoginManager, login_required, current_user
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import json
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
app.config['FRONTEND_FOLDER'] = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend')

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

# User loader function
@login_manager.user_loader
def load_user(user_id):
    from models.user_model import User
    return User.get_by_id(user_id)

# Import and register blueprints
from routes.auth_routes import auth_bp
from routes.ip_routes import ip_bp
from routes.blockchain_routes import blockchain_bp

app.register_blueprint(auth_bp)
app.register_blueprint(ip_bp)
app.register_blueprint(blockchain_bp)

# Frontend routes
@app.route('/')
def serve_frontend_index():
    """Serve the frontend index.html file"""
    return send_from_directory(app.config['FRONTEND_FOLDER'], 'index.html')

@app.route('/<path:path>')
def serve_frontend_files(path):
    """Serve any frontend file"""
    if os.path.exists(os.path.join(app.config['FRONTEND_FOLDER'], path)):
        return send_from_directory(app.config['FRONTEND_FOLDER'], path)
    else:
        return send_from_directory(app.config['FRONTEND_FOLDER'], 'index.html')

# API Home route
@app.route('/api')
def api_index():
    """API Homepage with live patent feed"""
    return jsonify({"message": "Welcome to the IP NFT DApp API"})

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)