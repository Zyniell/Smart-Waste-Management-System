import os
from pathlib import Path
from typing import Dict, Tuple
import numpy as np
from PIL import Image
import tensorflow as tf

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "saved_models" / "waste_classifier.keras"
H5_PATH = BASE_DIR / "saved_models" / "waste_classifier.h5"

CLASSES = ["Organic Waste", "Paper Waste", "Plastic Waste"]
CLASS_MAPPING = {
    0: "Organic Waste",
    1: "Paper Waste",
    2: "Plastic Waste"
}

_model = None

def get_model():
    global _model
    if _model is not None:
        return _model
        
    target_path = None
    if MODEL_PATH.exists():
        target_path = str(MODEL_PATH)
    elif H5_PATH.exists():
        target_path = str(H5_PATH)
        
    if target_path:
        try:
            print(f"[ML Service] Loading trained model from {target_path}...")
            _model = tf.keras.models.load_model(target_path)
            print("[ML Service] Model loaded successfully.")
            return _model
        except Exception as e:
            print(f"[ML Service] Error loading saved model: {e}")
            
    print("[ML Service] No saved model found or load failed. Initializing MobileNetV2 model architecture...")
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet"
    )
    base_model.trainable = False
    
    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(128, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(3, activation="softmax")(x)
    
    _model = tf.keras.Model(inputs, outputs)
    _model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    return _model

def preprocess_image(image_file) -> np.ndarray:
    """Preprocess PIL Image or file-like object for MobileNetV2."""
    if not isinstance(image_file, Image.Image):
        image = Image.open(image_file)
    else:
        image = image_file
        
    if image.mode != "RGB":
        image = image.convert("RGB")
        
    image = image.resize((224, 224))
    img_array = np.array(image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_waste(image_file) -> Tuple[str, float, Dict[str, float]]:
    """
    Predict waste category from image.
    Returns: (predicted_category, confidence, probabilities_dict)
    """
    model = get_model()
    img_array = preprocess_image(image_file)
    
    # Run prediction
    preds = model.predict(img_array, verbose=0)[0]
    
    predicted_idx = int(np.argmax(preds))
    confidence = float(preds[predicted_idx])
    
    # Format probabilities
    probabilities = {
        CLASS_MAPPING.get(i, f"Class {i}"): round(float(preds[i]), 4)
        for i in range(len(preds))
    }
    
    predicted_category = CLASS_MAPPING.get(predicted_idx, "Plastic Waste")
    return predicted_category, round(confidence, 4), probabilities

