from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Path to the folder where you unzipped the model files
MODEL_PATH = "./saved_model"

print("--- Initializing Model ---")
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    print("Model loaded successfully!")
    print(f"Labels detected: {model.config.id2label}")
except Exception as e:
    print(f"Error loading model: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    prediction_idx = torch.argmax(probs, dim=-1).item()
    
    return jsonify({
        'label': model.config.id2label[prediction_idx],
        'confidence': round(probs[0][prediction_idx].item(), 4)
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)