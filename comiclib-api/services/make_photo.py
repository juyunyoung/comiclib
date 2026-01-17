import os
import io
import base64
import tempfile
from flask import Blueprint, request, jsonify
from google import genai
from google.genai import types

make_photo_bp = Blueprint('make_photo', __name__)


def generate_merged_photo(path1, path2, api_key):
    """
    Uploads two images and requests a merged generation from Gemini.
    Returns: Base64 encoded image string or raises Exception.
    """
    client = genai.Client(api_key=api_key)
    
    # 1. Upload images
    image_1_upload = client.files.upload(file=path1)
    image_2_upload = client.files.upload(file=path2)

    # 2. Request Image Synthesis
    model_name = "gemini-2.0-flash-exp" # "gemini-3-pro-image-preview"

    response = client.models.generate_content(
        model=model_name, 
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part.from_uri(file_uri=image_1_upload.uri, mime_type="image/jpeg"),
                    types.Part.from_uri(file_uri=image_2_upload.uri, mime_type="image/jpeg"),
                    types.Part.from_text(text="첫 번째 사진의 인물을 두 번째 사진의 인물을 아주 친한 친구인것 처럼 어깨 동무를 하고 환하게 웃는 얼굴로 합성해 주세요 .")
                ]
            )
        ],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"], 
        )
    )

    # 3. Process Result
    if response.generated_assets:
        asset = response.generated_assets[0]
        img_data = asset.image_bytes
        encoded_img = base64.b64encode(img_data).decode('utf-8')
        return encoded_img
    else:
        raise Exception("No image generated from Gemini")


@make_photo_bp.route('/makePhoto', methods=['POST'])
def make_photo():
    # Expecting two images: 'image_1' (person) and 'image_2' (background) as per user concept
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({"error": "Two image files (image1, image2) are required"}), 400
    
    file1 = request.files['image1']
    file2 = request.files['image2']
    
    if file1.filename == '' or file2.filename == '':
        return jsonify({"error": "No selected files"}), 400

    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"error": "Server configuration error: Missing Gemini API Key"}), 500

    temp1_path = None
    temp2_path = None

    try:
        # Save temporary files to upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp1, \
             tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp2:
            
            file1.save(temp1.name)
            file2.save(temp2.name)
            
            temp1_path = temp1.name
            temp2_path = temp2.name

        # Call the core logic
        encoded_img = generate_merged_photo(temp1_path, temp2_path, api_key)
        return jsonify({"image": encoded_img})

    except Exception as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500
        
    finally:
        # Cleanup temp files
        if temp1_path and os.path.exists(temp1_path):
            os.remove(temp1_path)
        if temp2_path and os.path.exists(temp2_path):
            os.remove(temp2_path)

if __name__ == "__main__":
    # Test Main Function
    import sys
    
    # Check for API Key
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment variables.")
        sys.exit(1)
        
    img1 = '../inosuke.webp'
    img2 = '../me.heic'
    
    if not os.path.exists(img1) or not os.path.exists(img2):
        print("Error: One or both image files do not exist.")
        sys.exit(1)
        
    print(f"Testing generation with: {img1} and {img2}...")
    try:
        result_b64 = generate_merged_photo(img1, img2, api_key)
        print("Success! Generated image (base64 length):", len(result_b64))
        
        # Save output to verify
        output_filename = "test_output.jpg"
        with open(output_filename, "wb") as f:
            f.write(base64.b64decode(result_b64))
        print(f"Saved generated image to: {output_filename}")
        
    except Exception as e:
        print(f"Test Failed: {e}")
