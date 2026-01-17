import os
import io
import base64
import tempfile
from flask import Blueprint, request, jsonify
from google import genai
from google.genai import types

make_photo_bp = Blueprint('make_photo', __name__)

def generate_merged_photo(path1, path2, keyword1, keyword2, api_key):
    """
    Uploads two images via inline bytes and requests merged generation.
    Returns: Base64 encoded image string or raises Exception.
    """
    client = genai.Client(api_key=api_key)
    
    # Read files as bytes for Inline Data
    with open(path1, "rb") as f:
        img1_data = f.read()
    with open(path2, "rb") as f:
        img2_data = f.read()

    # Create Parts with inline data
    part1 = types.Part.from_bytes(data=img1_data, mime_type="image/jpeg")
    part2 = types.Part.from_bytes(data=img2_data, mime_type="image/jpeg")
    prompt_part = types.Part.from_text(text=f"사진의 인물들을 추출하여 다음의 상황으로 합성해 주세요. 키워드 1: {keyword1}, 키워드 2: {keyword2}")
    print(f"Debug - Prompt: {prompt_part}")
    model_name = "gemini-3-pro-image-preview"
    
    # Configure Safety Settings
    safety_settings = [
        types.SafetySetting(
            category="HARM_CATEGORY_HARASSMENT",
            threshold="BLOCK_NONE"
        ),
        types.SafetySetting(
            category="HARM_CATEGORY_HATE_SPEECH",
            threshold="BLOCK_NONE"
        ),
        types.SafetySetting(
            category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold="BLOCK_NONE"
        ),
        types.SafetySetting(
            category="HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold="BLOCK_NONE"
        ),
    ]

    # Generate Content
    response = client.models.generate_content(
        model=model_name,
        contents=[
            types.Content(
                role="user",
                parts=[part1, part2, prompt_part]
            )
        ],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            safety_settings=safety_settings
        )
    )

    # Process Result
    print(f"Debug - Full Response: {response}")
    
    if hasattr(response, 'generated_images') and response.generated_images:
         image = response.generated_images[0]
         return base64.b64encode(image.image_bytes).decode('utf-8')
         
    # Fallback: check parts if generated_images key isn't populated for this model
    if response.candidates:
        for candidate in response.candidates:
            if candidate.content and candidate.content.parts:
                for part in candidate.content.parts:
                    if part.inline_data:
                        return base64.b64encode(part.inline_data.data).decode('utf-8')
    
    # If we get here, likely failure or text response
    if response.text:
         raise Exception(f"Model returned text instead of image: {response.text}")
         
    raise Exception("No image generated from Gemini")


@make_photo_bp.route('/makePhoto', methods=['POST'])
def make_photo():
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({"error": "Two image files (image1, image2) are required"}), 400
    
    file1 = request.files['image1']
    file2 = request.files['image2']
    
    # Get keywords from form data
    keyword1 = request.form.get('keyword1', '어깨 동무')
    keyword2 = request.form.get('keyword2', '환하게 웃는 얼굴')
    
    if file1.filename == '' or file2.filename == '':
        return jsonify({"error": "No selected files"}), 400

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"error": "Server configuration error: Missing Gemini API Key"}), 500

    temp1_path = None
    temp2_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp1, \
             tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp2:
            
            file1.save(temp1.name)
            file2.save(temp2.name)
            
            temp1_path = temp1.name
            temp2_path = temp2.name

        encoded_img = generate_merged_photo(temp1_path, temp2_path, keyword1, keyword2, api_key)
        return jsonify({"image": encoded_img})

    except Exception as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500
        
    finally:
        if temp1_path and os.path.exists(temp1_path):
            os.remove(temp1_path)
        if temp2_path and os.path.exists(temp2_path):
            os.remove(temp2_path)

if __name__ == "__main__":
    import sys
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment variables.")
        sys.exit(1)
        
    img1 = 'inosuke.webp'
    img2 = 'me.heic'
    
    if not os.path.exists(img1):
         # Try parent dir just in case
         if os.path.exists('../'+img1):
             img1 = '../'+img1
             img2 = '../'+img2
    
    print(f"Testing generation with: {img1} and {img2}...")
    try:
        # Test keywords
        test_kw1 = "같이 춤을 추는"
        test_kw2 = "신나는"
        result_b64 = generate_merged_photo(img1, img2, test_kw1, test_kw2, api_key)
        print("Success! Generated image (base64 length):", len(result_b64))
        
        output_filename = "../temp/test_output.jpg"
        # Ensure temp directory exists
        os.makedirs(os.path.dirname(output_filename), exist_ok=True)
        
        with open(output_filename, "wb") as f:
            f.write(base64.b64decode(result_b64))
        print(f"Saved generated image to: {output_filename}")
        
    except Exception as e:
        print(f"Test Failed: {e}")
