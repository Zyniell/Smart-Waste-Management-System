import os
import shutil
import zipfile
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"
ZIP_PATH = BASE_DIR / "garbage_classification.zip"
EXTRACT_DIR = BASE_DIR / "kaggle_extracted"

URL = "https://huggingface.co/datasets/UdaraChamidu/Garbage-Classification-with-12-classes/resolve/main/garbage_classification.zip"

def download_dataset():
    if not ZIP_PATH.exists():
        print(f"[Dataset] Downloading real Garbage Classification dataset (239 MB) from mirror...")
        
        def reporthook(block_num, block_size, total_size):
            downloaded = block_num * block_size
            if total_size > 0:
                percent = downloaded * 100 / total_size
                if block_num % 1000 == 0:
                    print(f"  Downloaded: {downloaded / (1024*1024):.1f} MB / {total_size / (1024*1024):.1f} MB ({percent:.1f}%)")
                    
        urllib.request.urlretrieve(URL, str(ZIP_PATH), reporthook=reporthook)
        print("[Dataset] Download complete!")
    else:
        print("[Dataset] ZIP file already exists locally.")

def extract_and_organize():
    print("[Dataset] Extracting ZIP archive...")
    if not EXTRACT_DIR.exists():
        EXTRACT_DIR.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
            zip_ref.extractall(EXTRACT_DIR)
        print("[Dataset] Extraction done.")
    else:
        print("[Dataset] Extracted folder already exists.")

    # Re-create train and test directories
    train_dir = DATASET_DIR / "train"
    test_dir = DATASET_DIR / "test"
    
    # Clean previous synthetic dataset
    if DATASET_DIR.exists():
        shutil.rmtree(DATASET_DIR)
        
    for d in [train_dir, test_dir]:
        for c in ["organic", "paper", "plastic"]:
            (d / c).mkdir(parents=True, exist_ok=True)

    # Find the category folders
    category_map = {
        "organic": ["biological", "organic"],
        "paper": ["paper", "cardboard"],
        "plastic": ["plastic"]
    }

    print("[Dataset] Filtering and populating Organic, Paper, and Plastic datasets...")
    for root, dirs, files in os.walk(EXTRACT_DIR):
        folder_name = os.path.basename(root).lower()
        target_class = None
        for cls_name, keywords in category_map.items():
            if folder_name in keywords:
                target_class = cls_name
                break
                
        if target_class and files:
            img_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            print(f"  Found {len(img_files)} images in folder '{folder_name}' -> Class: {target_class}")
            
            # Select up to 150 real images per category (120 train, 30 test)
            selected = img_files[:150]
            split_idx = int(len(selected) * 0.8)
            train_files = selected[:split_idx]
            test_files = selected[split_idx:]
            
            for f in train_files:
                shutil.copy2(os.path.join(root, f), train_dir / target_class / f"{folder_name}_{f}")
            for f in test_files:
                shutil.copy2(os.path.join(root, f), test_dir / target_class / f"{folder_name}_{f}")

    print("\n[Dataset Summary]:")
    for split in ["train", "test"]:
        for c in ["organic", "paper", "plastic"]:
            count = len(list((DATASET_DIR / split / c).glob("*.*")))
            print(f"  {split}/{c}: {count} real images")

if __name__ == "__main__":
    download_dataset()
    extract_and_organize()

