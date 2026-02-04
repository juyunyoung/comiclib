import os
from flask import Blueprint, request, jsonify
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta, timezone

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
        model='gemini-3-flash-preview',
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

# Define Pydantic models for structured output
class GameItem(BaseModel):
    title: str = Field(description="Title of the game or book")
    image: str = Field(description="URL of the cover image or representative image")
    author: str = Field(description="Developer or Author of the game/book")
    description: str = Field(description="Brief description of the item")

class GameSearchResponse(BaseModel):
    items: List[GameItem]

def get_game_search_info(query, api_key):
    """
    Performs a Google Search grounded query using Gemini to find game info.
    Returns: Dict with 'items' list matching the requested structure.
    """
    client = genai.Client(api_key=api_key)

    system_instruction = """
    당신은 게임 전문가 AI 에이전트입니다.
    사용자의 검색어에 맞는 게임이나 관련 정보를 Google 검색을 통해 찾아서 목록으로 정리해주세요.
    각 항목은 제목, 이미지URL, 작가(혹은 개발사), 설명으로 구성되어야 합니다.
    이미지는 Google 검색 결과에서 최신의 가장 적절한 이미지를 선택해주세요.
    검색 결과는 반드시 한국어로 작성해주세요.
    
    응답은 반드시 다음 JSON 형식을 따라주세요. 코드 블록 없이 JSON만 반환하세요.
    {
        "items": [
            {
                "title": "제목",
                "image": "이미지URL",
                "author": "작가/개발사",
                "description": "설명"
            }
        ]
    }
    """

    import json
    import re
    
    try:
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=query,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=[types.Tool(google_search=types.GoogleSearch())],
            )
        )
        
        text = response.text
        # Remove code blocks if present
        text = re.sub(r'```json\s*|\s*```', '', text)
        return json.loads(text)
    except Exception as e:
        print(f"Gemini Game Agent error: {str(e)}")
        # Fallback
        return {"items": []}


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


@search_info_bp.route('/search/game', methods=['GET'])
def search_game_info():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"error": "Server configuration error: Missing Gemini API Key"}), 500

    try:
        result = get_game_search_info(query, api_key)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Gemini Game Agent error: {str(e)}"}), 500


# Character Search Models and Function
class CharacterItem(BaseModel):
    name: str = Field(description="Name of the character")
    image: str = Field(description="URL of the character's image")
    description: str = Field(description="Brief description of the character")

class CharacterSearchResponse(BaseModel):
    characters: List[CharacterItem]

def get_character_info(query, api_key):
    """
    Performs a Google Search grounded query using Gemini to find character info.
    Returns: Dict with 'characters' list.
    """
    client = genai.Client(api_key=api_key)

    system_instruction = """
    당신은 만화 및 게임 캐릭터 전문가 AI 에이전트입니다.
    사용자가 입력한 만화 또는 게임 제목과 관련된 주요 캐릭터들을 Google 검색을 통해 찾아서 목록으로 정리해주세요.
    각 항목은 캐릭터 이름, 이미지URL, 설명으로 구성되어야 합니다.
    이미지는 Google 검색 결과에서 해당 캐릭터를 잘 나타내는 이미지를 선택해주세요.
    검색 결과는 반드시 한국어로 작성해주세요.
    
    응답은 반드시 다음 JSON 형식을 따라주세요. 코드 블록 없이 JSON만 반환하세요.
    {
        "characters": [
            {
                "name": "캐릭터 이름",
                "image": "이미지URL",
                "description": "설명"
            }
        ]
    }
    """

    import json
    import re

    try:
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=f"'{query}'에 등장하는 주요 캐릭터들을 찾아주세요.",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=[types.Tool(google_search=types.GoogleSearch())],
            )
        )
        
        text = response.text
        text = re.sub(r'```json\s*|\s*```', '', text)
        return json.loads(text)
    except Exception as e:
        print(f"Character Search Parsing Error: {e}")
        return {"characters": []}

@search_info_bp.route('/search/character', methods=['GET'])
def search_character_info():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"error": "Server configuration error: Missing Gemini API Key"}), 500

    try:
        result = get_character_info(query, api_key)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Gemini Character Agent error: {str(e)}"}), 500


# Comprehensive Search Agent
class SearchInfoItem(BaseModel):
    category: str = Field(description="Category of the information (e.g., 'Game Website', 'Publisher', 'Event', 'Collab', 'Popup Store', 'Game Sale', 'Release Date')")
    title: str = Field(description="Title or headline of the information")
    link: str = Field(description="URL link to the detailed information")
    content: str = Field(description="Brief summary or content of the information")
    date: str = Field(description="Date relative to the information if available, otherwise empty string")

class ComprehensiveSearchResponse(BaseModel):
    items: List[SearchInfoItem]

def get_comprehensive_search_info(user_id, api_key):
    """
    Performs a grounded search to find info for characters in user's news list.
    Categories: Game Website, Publisher, Event, Collab, Popup Store, Game Sale, Release Date.
    """
    from services.comic_service import ComicService
    comic_service = ComicService()
    
    # Fetch characters from news list
    character_data = comic_service.get_news_list_data(user_id)
    
    if not character_data:
         return {"items": []}
         
    # Construct a list string for the prompt
    # format: "CharacterName (ComicTitle)"
    target_list = []
    for item in character_data:
        char_name = item.get('character_name', 'Unknown')
        comic = item.get('comics', {})
        comic_title = comic.get('title', 'Unknown') if comic else 'Unknown'
        target_list.append(f"{char_name} (작품: {comic_title})")
    
    targets_str = ", ".join(target_list)
    print(f"Targeting characters: {targets_str}")

    client = genai.Client(api_key=api_key)
    #오늘 날짜 -2달
    today = datetime.now(timezone.utc).replace(microsecond=0)
    two_months_before = today - timedelta(days=60)
    

    print(two_months_before)
    system_instruction = f"""
    당신은 서브컬처(게임, 만화, 애니메이션) 정보 수집 전문 AI 에이전트입니다.
    사용자가 요청한 대상 캐릭터 위주의  최신 소식과 정보를 Google 검색을 통해 수집하여 카테고리별로 정리해주세요.
    
    나무위키 싸이트는 제외해주세요
    
    [수집 대상 싸이트]
    0. 최신 소식 (News)
    1. 게임 홈페이지 (Game Website)
    2. 만화 출판사 (Publisher)
    3. 이벤트 사이트 (Event Site)
    4. 캐릭터 콜라보 소식 (Collab News)
    5. 팝업 스토어 정보 (Popup Store)
    6. 게임 판매 소식 (Game Sale)
    7. 만화책 출판일 (Release Date)
    
    각 정보는 제목, 링크(URL), 내용 요약, 날짜(확인 가능한 경우)를 포함해야 합니다.
   
    검색 결과는 반드시 한국어로 작성해주세요.
    최신 정보를 우선적으로 찾아주세요. {two_months_before} 이전의 정보는 목록에서 제외해주세요.
    응답은 반드시 다음 JSON 형식을 따라주세요. 코드 블록 없이 JSON만 반환하세요.
    {{
        "items": [
            {{
                
                "title": "제목",
                "link": "URL",
                "content": "내용 요약",
                "date": "2024-01-01 등의 날짜 또는 '2024년 1월' 등, 없으면 빈문자열"
            }}
        ]
    }}

    
    """

    import json
    import re

    try:
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=f"다음 캐릭터들과 작품에 대한 최신 소식(홈페이지, 이벤트, 콜라보, 굿즈, 출판 등)을 모두 찾아주세요: {targets_str} ,{two_months_before} 이전의 정보는 목록에서 제외해주세요.",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=[types.Tool(google_search=types.GoogleSearch(
                    time_range_filter=types.Interval(
                        start_time=two_months_before,
                        end_time=today
                    )
                ))],
            )
        )
        
        text = response.text
        text = re.sub(r'```json\s*|\s*```', '', text)
        return json.loads(text)
    except Exception as e:
        print(f"Comprehensive Search Agent Error: {e}")
        return {"items": []}

@search_info_bp.route('/search/comprehensive', methods=['GET'])
def search_comprehensive_info():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id parameter is required"}), 400

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"error": "Server configuration error: Missing Gemini API Key"}), 500

    try:
        result = get_comprehensive_search_info(user_id, api_key)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Gemini Comprehensive Agent error: {str(e)}"}), 500


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
