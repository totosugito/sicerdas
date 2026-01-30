#!/usr/bin/env python3
"""
Image Resizer Tool

This script resizes images by height while maintaining aspect ratio.
It processes images using glob filter patterns and renames them by 
replacing specified text in the filenames.

Usage:
    python image-resizer.py input_folder output_folder --height 300 --filter "*_cover*" --original cover --replacement md

Example:
    python image-resizer.py ./images ./resized --height 400 --filter "*_cover*" --original cover --replacement thumbnail
"""

import os
import sys
import argparse
import glob
from pathlib import Path
from PIL import Image, ImageOps
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ImageResizer:
    def __init__(self, input_folder, output_folder, target_height, filter_pattern="*_cover*", original="cover", replacement="md", compress=80):
        """
        Initialize the ImageResizer.
        
        Args:
            input_folder (str): Path to input folder containing images
            output_folder (str): Path to output folder for resized images
            target_height (int): Target height for resized images
            filter_pattern (str): Glob filter pattern to find files (default: "*_cover*")
            original (str): Original text to replace in filenames (default: "cover")
            replacement (str): Text to replace the original with (default: "md")
            compress (int): JPEG quality/compression level (1-100, default: 80)
        """
        self.input_folder = Path(input_folder)
        self.output_folder = Path(output_folder)
        self.target_height = target_height
        self.filter_pattern = filter_pattern
        self.original = original
        self.replacement = replacement
        self.compress = max(1, min(100, compress))  # Ensure value is between 1-100
        
        # Supported image formats
        self.supported_formats = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp')
        
    def validate_inputs(self):
        """Validate input parameters and folders."""
        if not self.input_folder.exists():
            raise ValueError(f"Input folder does not exist: {self.input_folder}")
            
        if not self.input_folder.is_dir():
            raise ValueError(f"Input path is not a directory: {self.input_folder}")
            
        if self.target_height <= 0:
            raise ValueError(f"Target height must be positive: {self.target_height}")
            
        # Create output folder if it doesn't exist
        self.output_folder.mkdir(parents=True, exist_ok=True)
        logger.info(f"Output folder: {self.output_folder}")
        
    def find_images(self):
        """Find all images using the specified filter pattern in the input folder recursively."""
        pattern_files = []
        
        # Apply filter pattern recursively
        matches = list(self.input_folder.rglob(self.filter_pattern))
        
        # Filter to keep only supported image formats
        for file_path in matches:
            if file_path.suffix.lower() in self.supported_formats:
                pattern_files.append(file_path)
            
        logger.info(f"Found {len(pattern_files)} images matching pattern '{self.filter_pattern}'")
        return pattern_files
        
    def resize_image(self, image_path):
        """Resize a single image by height while maintaining aspect ratio."""
        try:
            with Image.open(image_path) as img:
                # Get original dimensions
                original_width, original_height = img.size
                
                # Calculate new width maintaining aspect ratio
                aspect_ratio = original_width / original_height
                new_width = int(self.target_height * aspect_ratio)
                
                # Resize image
                resized_img = img.resize((new_width, self.target_height), Image.Resampling.LANCZOS)
                
                # Apply auto-orientation based on EXIF data
                resized_img = ImageOps.exif_transpose(resized_img)
                
                return resized_img, (original_width, original_height), (new_width, self.target_height)
                
        except Exception as e:
            logger.error(f"Error resizing image {image_path}: {e}")
            return None, None, None
            
    def generate_output_filename(self, input_path):
        """Generate output filename by replacing original text with replacement text."""
        # Calculate path relative to input_folder to preserve structure
        rel_path = input_path.relative_to(self.input_folder)
        parent_dir = rel_path.parent
        filename = input_path.name
        
        # Replace the original text in the filename
        if self.original in filename:
            new_filename = filename.replace(self.original, self.replacement)
        else:
            # Fallback: add replacement suffix before extension
            stem = input_path.stem
            suffix = input_path.suffix
            new_filename = f"{stem}_{self.replacement}{suffix}"
            
        return self.output_folder / parent_dir / new_filename
        
    def process_images(self):
        """Process all found images."""
        image_files = self.find_images()
        
        if not image_files:
            logger.warning(f"No images found matching pattern '{self.filter_pattern}' in {self.input_folder}")
            return
            
        processed_count = 0
        failed_count = 0
        
        for image_path in image_files:
            if processed_count % 200 == 0:
                logger.info(f"Processing {processed_count}/{len(image_files)} images")
            
            # Resize the image
            resized_img, original_size, new_size = self.resize_image(image_path)
            
            if resized_img is None:
                failed_count += 1
                continue
                
            # Generate output filename
            output_path = self.generate_output_filename(image_path)
            
            # Ensure output directory exists (preserving structure)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            try:
                # Save the resized image with compression quality
                if output_path.suffix.lower() in ['.jpg', '.jpeg']:
                    resized_img.save(output_path, quality=self.compress, optimize=True)
                else:
                    # For non-JPEG formats, use optimize but no quality setting
                    resized_img.save(output_path, optimize=True)
                
                if processed_count % 200 == 0:
                    if original_size and new_size:
                        logger.info(
                            f"✓ Saved: {output_path.name} "
                            f"({original_size[0]}x{original_size[1]} → {new_size[0]}x{new_size[1]})"
                        )
                    else:
                        logger.info(f"✓ Saved: {output_path.name}")
                processed_count += 1
                
            except Exception as e:
                logger.error(f"Error saving {output_path}: {e}")
                failed_count += 1
                
        logger.info(f"\nProcessing complete!")
        logger.info(f"Successfully processed: {processed_count} images")
        if failed_count > 0:
            logger.warning(f"Failed to process: {failed_count} images")
            
    def run(self):
        """Run the image resizing process."""
        try:
            logger.info("Starting Image Resizer...")
            logger.info(f"Input folder: {self.input_folder}")
            logger.info(f"Target height: {self.target_height}px")
            logger.info(f"Compression quality: {self.compress}")
            logger.info(f"Filter pattern: '{self.filter_pattern}'")
            logger.info(f"Original text: '{self.original}'")
            logger.info(f"Replacement suffix: '_{self.replacement}'")
            
            self.validate_inputs()
            self.process_images()
            
        except Exception as e:
            logger.error(f"Error: {e}")
            sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Resize images by height while maintaining aspect ratio",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python image-resizer.py ./photos ./resized --height 400
  python image-resizer.py ./images ./output --height 300 --filter "*cover*.jpg" --original cover --replacement thumbnail --compress 80
  python image-resizer.py "C:/Images" "C:/Resized" --height 500 --filter "*cover*.jpg" --original cover --replacement md --compress 80
        """
    )
    
    parser.add_argument(
        "input_folder",
        help="Path to input folder containing images"
    )
    
    parser.add_argument(
        "output_folder",
        help="Path to output folder for resized images"
    )
    
    parser.add_argument(
        "--height",
        type=int,
        required=True,
        help="Target height for resized images (in pixels)"
    )
    
    parser.add_argument(
        "--filter",
        type=str,
        default="*_cover*",
        help="Glob pattern to filter files (default: '*_cover*')"
    )
    
    parser.add_argument(
        "--original",
        type=str,
        default="cover",
        help="Original text to replace in filenames (default: 'cover')"
    )
    
    parser.add_argument(
        "--replacement",
        type=str,
        default="md",
        help="Text to replace the suffix with (default: 'md')"
    )
    
    parser.add_argument(
        "--compress",
        type=int,
        default=80,
        help="JPEG compression quality (1-100, default: 80)"
    )
    
    args = parser.parse_args()
    
    # Create and run the resizer
    resizer = ImageResizer(
        input_folder=args.input_folder,
        output_folder=args.output_folder,
        target_height=args.height,
        filter_pattern=args.filter,
        original=args.original,
        replacement=args.replacement,
        compress=args.compress
    )
    
    resizer.run()

if __name__ == "__main__":
    # python ./src/tools/image-resizer.py "E:/Cloud/SiCerdas/perpustakaan/pages/0/lg" "E:/Cloud/SiCerdas/perpustakaan/pages/0/xs" --height 200 --filter "*_lg.jpg" --original lg --replacement xs --compress 80
    main()