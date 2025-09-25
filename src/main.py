import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, Response
from flask_cors import CORS
import mimetypes
from src.models.ems_models import db
from src.routes.auth import auth_bp
from src.routes.community import community_bp
from src.routes.driver import driver_bp
from src.routes.office import office_bp
from src.routes.news import news_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'

# Enable CORS for all routes
CORS(app)

# Configure MIME types for TypeScript and JavaScript modules
@app.after_request
def after_request(response):
    # Set correct MIME types for module scripts
    if response.headers.get('Content-Type') == 'application/octet-stream':
        if hasattr(response, 'direct_passthrough') and response.direct_passthrough:
            # This is a file response, check the path
            path = getattr(response, '_file_path', '')
            if path.endswith(('.tsx', '.ts', '.jsx', '.js')):
                response.headers['Content-Type'] = 'application/javascript'
    return response

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(community_bp, url_prefix='/api/community')
app.register_blueprint(driver_bp, url_prefix='/api/driver')
app.register_blueprint(office_bp, url_prefix='/api/office')
app.register_blueprint(news_bp, url_prefix='/api/news')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        # Set correct MIME types for TypeScript and JavaScript modules
        if path.endswith(('.tsx', '.ts', '.jsx', '.js')):
            with open(os.path.join(static_folder_path, path), 'r', encoding='utf-8') as f:
                content = f.read()
            response = Response(content, mimetype='application/javascript')
            return response
        else:
            return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
