from flask import Flask, request, jsonify
from flask import send_file
import os
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)

# Load model and class names
model = tf.keras.models.load_model("FinalDoodleModel.keras")
with open("class_names_final.txt", "r") as f:
    class_names = [line.strip() for line in f.readlines()]

def preprocess_image(image_data):
    """Preprocess incoming image for model prediction."""
    img = Image.open(BytesIO(image_data))

    # print(f"Original Image Mode: {img.mode}")  # Debugging

    # Convert RGBA (with transparency) to white background
    if img.mode == 'RGBA':
        new_img = Image.new("RGB", img.size, "white")  # Create white background
        new_img.paste(img, mask=img.split()[3])  # Apply transparency mask
        img = new_img

    img = img.convert('L')  # Convert to grayscale
    img = img.resize((28, 28), Image.LANCZOS)  # Resize

    # Convert to numpy array
    img_array = np.array(img)

    # Debugging
    # print("Processed Image Array:\n", img_array)

    # Normalize pixels
    img_array = 1.0 - (img_array / 255.0)

    return np.expand_dims(img_array, axis=[0, -1])

@app.route('/api/image', methods=['GET'])
def send_image():
    image_path = "received_image.png"  # Replace with your actual image file path
    if not os.path.exists(image_path):
        return {"error": "Image not found"}, 404
    return send_file(image_path, mimetype="image/jpeg")

@app.route('/predict', methods=['POST'])
def predict():
    """Receive image from frontend, preprocess, and make prediction."""
    try:
        # Get and decode base64 image
        data = request.json['image']
        _, encoded = data.split(",", 1)
        image_data = base64.b64decode(encoded)

        # Debugging: Save received image
        with open("received_image.png", "wb") as f:
            f.write(image_data)

        # Preprocess image
        processed_image = preprocess_image(image_data)

        # Make prediction
        predictions = model.predict(processed_image)[0]

        # Get top 5 predictions
        top_indices = np.argsort(-predictions)[:1]
        results = {
            "predictions": [class_names[i] for i in top_indices],
            "confidences": [float(predictions[i]) for i in top_indices]
        }

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
