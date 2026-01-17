
import os
import datetime
from flask import Blueprint, jsonify
from google import genai
from google.genai import types

news_bp = Blueprint('news', __name__)

def get_daily_news(api_key):
    """
    Fetches daily news using Gemini with Google Search tool.
    Returns: List of news items.
    """
    client = genai.Client(api_key=api_key)
    
    current_date = datetime.date.today().strftime("%Y-%m-%d")
    prompt = f"""You are a news aggregator. Search for the latest, major news and events related to popular webtoons, manhwa, and anime in Korea for today ({current_date}). 
    Strictly return ONLY a JSON array of 5 summary items. Do not include any conversational text, markdown formatting, or code blocks.
    Format: [ {{ "title": "...", "date": "...", "description": "...", "link": "..." }} ]. 
    For the link, provide a source URL if found, otherwise empty string."""

    response = client.models.generate_content(
        model='gemini-2.0-flash-exp',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            tools=[types.Tool(google_search=types.GoogleSearch())],
        )
    )
    
    # Parse generic response
    # Since we requested JSON mime type, we might get a structured json string directly
    # But usually response.text contains the string.
    try:
        import json
        text_part = response.text
        # Clean up if markdown block exists
        if text_part.startswith("```json"):
            text_part = text_part[7:]
        if text_part.endswith("```"):
            text_part = text_part[:-3]
        
        return json.loads(text_part)
    except Exception as e:
        print(f"Error parsing news JSON: {e}")
        return []

@news_bp.route('/news', methods=['GET'])
def news():
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"error": "Server configuration error: Missing Gemini API Key"}), 500

    try:
        news_items = get_daily_news(api_key)
        return jsonify(news_items)

    except Exception as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500

if __name__ == "__main__":
    import sys
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("Error: GEMINI_API_KEY not found.")
        sys.exit(1)
        
    print("Fetching daily news...")
    items = get_daily_news(api_key)
    print(items)
