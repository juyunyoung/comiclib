import os
import requests
from flask import Blueprint, request, jsonify

naver_bp = Blueprint('naver_search', __name__)

@naver_bp.route('/naver/search/book.json', methods=['GET'])
def search_book_proxy():
    query = request.args.get('query')
    display = request.args.get('display', 10)
    start = request.args.get('start', 1)
    
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    client_id = os.environ.get('NAVER_CLIENT_ID')
    client_secret = os.environ.get('NAVER_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        return jsonify({"error": "Server configuration error: Missing Naver API credentials"}), 500

    api_url = "https://openapi.naver.com/v1/search/book.json"
    headers = {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret
    }
    params = {
        "query": query,
        "display": display,
        "start": start
    }

    try:
        response = requests.get(api_url, headers=headers, params=params)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
         return jsonify({"error": f"Naver API error: {str(e)}"}), 502
