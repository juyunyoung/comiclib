import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Import services (we will define these blueprints/routes next)
from services.make_photo import make_photo_bp
from services.search_info import search_info_bp
from services.search_info import search_info_bp
from services.news import news_bp
from services.comics import comics_bp

# Register Blueprints
app.register_blueprint(make_photo_bp, url_prefix='/api')
app.register_blueprint(search_info_bp, url_prefix='/api')
app.register_blueprint(search_info_bp, url_prefix='/api')
app.register_blueprint(news_bp, url_prefix='/api')
app.register_blueprint(comics_bp, url_prefix='/api')

@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "service": "comiclib-api"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
