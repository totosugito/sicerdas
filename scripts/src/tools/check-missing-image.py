import os
import json
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def check_missing_images(input_dir):
    """
    Checks for missing images in the structure:
    {input_dir}/{first_digit}/lg/{folder_id}/{folder_id}_0000_lg.jpg
    """
    input_path = Path(input_dir)
    missing_dirs = []
    
    if not input_path.exists():
        logger.error(f"Input directory '{input_dir}' does not exist.")
        return []

    logger.info(f"Starting scan in: {input_path}")
    
    # Counters for progress
    total_checked = 0
    
    # The structure is expected to be inputDir/{0-9}/lg/{folder_id}
    # We can iterate through the subdirectories of inputDir
    try:
        # Sort to have a predictable order
        digit_dirs = sorted([d for d in input_path.iterdir() if d.is_dir()])
        
        for digit_dir in digit_dirs:
            lg_dir = digit_dir / "lg"
            if not lg_dir.exists() or not lg_dir.is_dir():
                logger.warning(f"Skipping {digit_dir}: 'lg' subdirectory not found.")
                continue
                
            logger.info(f"Checking directory: {digit_dir.name}/lg/")
            
            # Subdirectories under lg/ are the folder_ids
            folder_id_dirs = sorted([d for d in lg_dir.iterdir() if d.is_dir()])
            
            for folder_id_dir in folder_id_dirs:
                folder_id = folder_id_dir.name
                target_filename = f"{folder_id}_0000_lg.jpg"
                target_file = folder_id_dir / target_filename
                
                total_checked += 1
                
                if not target_file.exists():
                    # Record relative path from input_dir
                    rel_path = folder_id_dir.relative_to(input_path)
                    missing_dirs.append({
                        "id": folder_id,
                        "path": str(rel_path).replace("\\", "/"),
                        "expected_file": target_filename
                    })
                    logger.warning(f"Missing image in: {rel_path}")
                
                # Periodically log progress for large datasets
                if total_checked % 1000 == 0:
                    logger.info(f"Processed {total_checked} directories...")

    except Exception as e:
        logger.error(f"An error occurred during scanning: {e}")

    return missing_dirs

def main():
    # Configuration
    input_dir = r'E:\Cloud\si-cerdas\book\images'
    output_filename = 'missing_image_directories.json'
    
    # Get the directory where the script is located to save the output there
    script_dir = Path(__file__).parent
    output_path = script_dir / output_filename
    
    missing_data = check_missing_images(input_dir)
    
    # Prepare final JSON structure
    result = {
        "input_directory": input_dir,
        "total_checked": 0, # We'll update this if we track it better
        "missing_count": len(missing_data),
        "missing_directories": missing_data
    }
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=4)
        logger.info(f"Scan complete. Found {len(missing_data)} missing images.")
        logger.info(f"Results saved to: {output_path}")
    except Exception as e:
        logger.error(f"Failed to save JSON output: {e}")

if __name__ == "__main__":
    main()
