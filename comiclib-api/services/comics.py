import os
import uuid
from flask import Blueprint, request, jsonify, url_for, current_app
from services.comic_service import ComicService
from werkzeug.utils import secure_filename

comics_bp = Blueprint('comics', __name__)
comic_service = ComicService()

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@comics_bp.route('/comics', methods=['GET'])
def get_comics():
    try:
        data = comic_service.get_comics()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@comics_bp.route('/comics', methods=['POST'])
def add_comic():
    try:
        data = request.json
        # Validate required fields if necessary
        result = comic_service.add_comic(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@comics_bp.route('/comics/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Generate unique filename
        filename = f"{uuid.uuid4()}_{filename}"
        
        # Ensure upload directory exists
        upload_path = os.path.join(current_app.root_path, UPLOAD_FOLDER)
        os.makedirs(upload_path, exist_ok=True)
        
        file.save(os.path.join(upload_path, filename))
        
        # Construct full URL (assuming api is serving static files)
        # Note: In production, you might want to serve these differently.
        # For now, we'll return a relative URL that the frontend can use or a full URL.
        # Since frontend proxies /api to backend, we can return /static/uploads/...
        # But we need to make sure app serves static.
        
        file_url = url_for('static', filename=f'uploads/{filename}', _external=True)
        
        return jsonify({'url': file_url}), 200
    return jsonify({'error': 'File type not allowed'}), 400
