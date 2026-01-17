import os
from flask import Blueprint, request, jsonify
from google import genai
from google.genai import types

search_info_bp = Blueprint('search_info', __name__)


def get_search_info(query, api_key):
    """
    Performs a Google Search grounded query using Gemini.
    Returns: Dict containing text, agent_role, and sources.
    """
    client = genai.Client(api_key=api_key)

    # Agent configuration: system instruction + tool
    # Define a persona for the agent
    system_instruction = "당신은 만화책 전문가 AI 에이전트입니다. 사용자의 질문에 대해 Google 검색을 사용하여 정확하고 풍부한 정보를 찾아 답변해주세요. 특히 만화 관련 리뷰나 영상(YouTube)이 있다면 해당 정보도 함께 찾아서 소개해 주세요. 답변은 한국어로 친절하게 작성해주세요."

    response = client.models.generate_content(
        model='gemini-2.0-flash-exp',
        contents=query,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=[types.Tool(google_search=types.GoogleSearch())],
        )
    )
    
    sources = []
    if response.candidates and response.candidates[0].grounding_metadata:
        gm = response.candidates[0].grounding_metadata
        if hasattr(gm, 'grounding_chunks'):
            for chunk in gm.grounding_chunks:
                if hasattr(chunk, 'web') and chunk.web:
                    url = chunk.web.uri
                    source_type = "web"
                    if "youtube.com" in url or "youtu.be" in url:
                        source_type = "youtube"
                        
                    sources.append({
                        "title": chunk.web.title,
                        "url": url,
                        "type": source_type
                    })

    # Structure the result as an agent response
    result = {
        "text": response.text,
        "agent_role": "Comic Expert",
        "sources": sources
    }
    return result

@search_info_bp.route('/searchInfo', methods=['GET'])
def search_info():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"error": "Server configuration error: Missing Gemini API Key"}), 500

    try:
        result = get_search_info(query, api_key)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Gemini Agent error: {str(e)}"}), 500


if __name__ == "__main__":
    import sys
    from dotenv import load_dotenv
    
    # Load env
    load_dotenv()
    
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("Error: GEMINI_API_KEY not found.")
        sys.exit(1)
        
    query = "Solo Leveling news"
    if len(sys.argv) > 1:
        query = sys.argv[1]
        
    print(f"Testing search_info with query: '{query}'...")
    try:
        result = get_search_info(query, api_key)
        print("\n--- Result ---")
        print(f"Agent ({result['agent_role']}): {result['text'][:100]}...")
        print(f"\nSources Found: {len(result['sources'])}")
        for i, src in enumerate(result['sources']):
            print(f"{i+1}. {src['title']} ({src['type']}) - {src['url']}")
    
    except Exception as e:
        print(f"Test Failed: {e}")
