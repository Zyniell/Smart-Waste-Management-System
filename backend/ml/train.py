import os
import json
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"
TRAIN_DIR = DATASET_DIR / "train"
TEST_DIR = DATASET_DIR / "test"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
REPORTS_DIR = BASE_DIR / "reports"

SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 12

def load_datasets():
    print(f"[ML Training] Loading real Kaggle Garbage Classification datasets from {DATASET_DIR}...")
    
    train_ds = tf.keras.utils.image_dataset_from_directory(
        TRAIN_DIR,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="int",
        shuffle=True
    )
    
    test_ds = tf.keras.utils.image_dataset_from_directory(
        TEST_DIR,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="int",
        shuffle=False
    )
    
    class_names = train_ds.class_names
    print(f"[ML Training] Classes found: {class_names}")
    
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(200).prefetch(buffer_size=AUTOTUNE)
    test_ds = test_ds.cache().prefetch(buffer_size=AUTOTUNE)
    
    return train_ds, test_ds, class_names

def build_model(num_classes: int):
    print("[ML Training] Constructing MobileNetV2 Transfer Learning architecture...")
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet"
    )
    # Freeze base model weights
    base_model.trainable = False
    
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.2),
        tf.keras.layers.RandomZoom(0.15),
        tf.keras.layers.RandomContrast(0.1),
    ], name="data_augmentation")
    
    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = data_augmentation(inputs)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.4)(x)
    x = tf.keras.layers.Dense(128, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)
    
    model = tf.keras.Model(inputs, outputs, name="RealWasteMobileNetV2")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=3e-4),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model

def plot_confusion_matrix(cm, class_names, output_path: Path):
    plt.figure(figsize=(7, 6))
    plt.imshow(cm, interpolation="nearest", cmap=plt.cm.Greens)
    plt.title("Confusion Matrix - Real Waste Classification (MobileNetV2)")
    plt.colorbar()
    tick_marks = np.arange(len(class_names))
    plt.xticks(tick_marks, class_names, rotation=45)
    plt.yticks(tick_marks, class_names)

    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(
                j, i, format(cm[i, j], "d"),
                horizontalalignment="center",
                color="white" if cm[i, j] > thresh else "black"
            )

    plt.ylabel("True Label")
    plt.xlabel("Predicted Label")
    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close()
    print(f"[ML Training] Confusion matrix plot saved to {output_path}")

def train_and_evaluate():
    # 1. Load data
    train_ds, test_ds, class_names = load_datasets()
    
    # 2. Build model
    model = build_model(len(class_names))
    
    # 3. Train
    print(f"[ML Training] Training MobileNetV2 on 600 real training images for {EPOCHS} epochs...")
    history = model.fit(
        train_ds,
        validation_data=test_ds,
        epochs=EPOCHS,
        verbose=1
    )
    
    # 4. Evaluate on test set
    print("\n[ML Training] Evaluating on 150 real testing images...")
    y_true = []
    y_pred_probs = []
    
    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_true.extend(labels.numpy())
        y_pred_probs.extend(preds)
        
    y_true = np.array(y_true)
    y_pred = np.argmax(np.array(y_pred_probs), axis=1)
    
    # Classification Report
    cr = classification_report(y_true, y_pred, target_names=class_names, output_dict=True)
    cr_text = classification_report(y_true, y_pred, target_names=class_names)
    print("\n=== CLASSIFICATION REPORT ===")
    print(cr_text)
    
    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    cm_path = REPORTS_DIR / "confusion_matrix.png"
    plot_confusion_matrix(cm, class_names, cm_path)
    
    # Test accuracy
    test_acc = float(cr["accuracy"])
    print(f"\n[ML Training] Real Test Accuracy: {test_acc * 100:.2f}% (Target: >= 80.00%)")
    
    # Save metrics JSON
    metrics = {
        "accuracy": round(test_acc, 4),
        "target_met": test_acc >= 0.80,
        "classes": class_names,
        "classification_report": cr,
        "confusion_matrix": cm.tolist()
    }
    with open(REPORTS_DIR / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
        
    # Save Model
    model_save_path = SAVED_MODELS_DIR / "waste_classifier.keras"
    model.save(model_save_path)
    print(f"[ML Training] Real trained model successfully saved to {model_save_path}!")
    
    return metrics

if __name__ == "__main__":
    train_and_evaluate()
