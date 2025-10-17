#!/usr/bin/env python3
"""
PDF Page to Image Converter

This script extracts random pages from PDF files and converts them to JPG images.
It processes PDFs using glob filter patterns and saves extracted pages with 
numbered filenames based on the original PDF name.

Usage:
    python pdf-page-to-image.py input_folder output_folder --pages 3 --filter "*.pdf" --suffix page

Example:
    python pdf-page-to-image.py ./pdfs ./images --pages 5 --filter "*_book.pdf" --suffix extract
"""

import os
import sys
import argparse
import random
from pathlib import Path
import logging
from typing import List, Tuple

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Error: PyMuPDF is required. Install it with: pip install PyMuPDF")
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow is required. Install it with: pip install Pillow")
    sys.exit(1)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PDFPageExtractor:
    def __init__(self, input_folder, output_folder, pages_count=3, filter_pattern="*.pdf", suffix="page", dpi=150, compress=85, height=800):
        """
        Initialize the PDFPageExtractor.
        
        Args:
            input_folder (str): Path to input folder containing PDF files
            output_folder (str): Path to output folder for extracted images
            pages_count (int): Number of random pages to extract per PDF (default: 3)
            filter_pattern (str): Glob filter pattern to find PDF files (default: "*.pdf")
            suffix (str): Suffix to add to extracted image filenames (default: "page")
            dpi (int): DPI for image extraction (default: 150)
            compress (int): JPEG quality/compression level (1-100, default: 85)
            height (int): Target height for output images in pixels (default: 800)
        """
        self.input_folder = Path(input_folder)
        self.output_folder = Path(output_folder)
        self.pages_count = max(1, pages_count)
        self.filter_pattern = filter_pattern
        self.suffix = suffix
        self.dpi = max(72, min(300, dpi))  # Ensure DPI is between 72-300
        self.compress = max(1, min(100, compress))  # Ensure value is between 1-100
        self.height = max(100, height)  # Ensure minimum height of 100px
        
    def validate_inputs(self):
        """Validate input parameters and folders."""
        if not self.input_folder.exists():
            raise ValueError(f"Input folder does not exist: {self.input_folder}")
            
        if not self.input_folder.is_dir():
            raise ValueError(f"Input path is not a directory: {self.input_folder}")
            
        # Create output folder if it doesn't exist
        self.output_folder.mkdir(parents=True, exist_ok=True)
        logger.info(f"Output folder: {self.output_folder}")
        
    def find_pdf_files(self):
        """Find all PDF files using the specified filter pattern in the input folder."""
        pdf_files = []
        
        # Apply filter pattern directly
        matches = list(self.input_folder.glob(self.filter_pattern))
        
        # Filter to keep only PDF files
        for file_path in matches:
            if file_path.suffix.lower() == '.pdf':
                pdf_files.append(file_path)
            
        logger.info(f"Found {len(pdf_files)} PDF files matching pattern '{self.filter_pattern}'")
        return pdf_files
        
    def get_pdf_info(self, pdf_path: Path) -> Tuple[int, Tuple[float, float]]:
        """Get PDF information including page count and page size."""
        try:
            doc = fitz.open(pdf_path)
            page_count = len(doc)
            
            # Get the size of the first page
            if page_count > 0:
                first_page = doc[0]
                rect = first_page.rect
                page_size = (rect.width, rect.height)
            else:
                page_size = (0, 0)
                
            doc.close()
            return page_count, page_size
            
        except Exception as e:
            logger.error(f"Error reading PDF {pdf_path}: {e}")
            return 0, (0, 0)
            
    def select_random_pages(self, total_pages: int) -> List[int]:
        """Select random page numbers to extract."""
        if total_pages == 0:
            return []
            
        # Ensure we don't try to extract more pages than available
        pages_to_extract = min(self.pages_count, total_pages)
        
        # Generate random page numbers (0-indexed)
        if pages_to_extract == total_pages:
            # If extracting all pages, just return all page numbers
            selected_pages = list(range(total_pages))
        else:
            # Randomly select pages without replacement
            selected_pages = random.sample(range(total_pages), pages_to_extract)
            
        return sorted(selected_pages)
        
    def extract_page_as_image(self, pdf_path: Path, page_num: int) -> Image.Image:
        """Extract a specific page from PDF as PIL Image and resize to target height."""
        try:
            doc = fitz.open(pdf_path)
            page = doc[page_num]
            
            # Create a matrix for the desired DPI
            mat = fitz.Matrix(self.dpi / 72, self.dpi / 72)
            
            # Render page to pixmap
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to PIL Image
            img_data = pix.tobytes("ppm")
            img = Image.open(io.BytesIO(img_data))
            
            # Resize image to target height while maintaining aspect ratio
            original_width, original_height = img.size
            if original_height != self.height:
                # Calculate new width maintaining aspect ratio
                aspect_ratio = original_width / original_height
                new_width = int(self.height * aspect_ratio)
                
                # Resize image
                img = img.resize((new_width, self.height), Image.Resampling.LANCZOS)
            
            doc.close()
            return img
            
        except Exception as e:
            logger.error(f"Error extracting page {page_num} from {pdf_path}: {e}")
            return None
            
    def generate_output_filename(self, pdf_path: Path, extraction_index: int) -> Path:
        """Generate output filename based on PDF name and extraction order."""
        # Remove .pdf extension and parse the filename
        pdf_stem = pdf_path.stem
        
        # Split filename by "_" and get only the first word
        first_word = pdf_stem.split("_")[0]
        
        # Format: xxxx_0001_suffix.jpg (extraction_index is 0-indexed, so add 1 for display)
        extraction_number = f"{extraction_index + 1:04d}"
        output_filename = f"{first_word}_{extraction_number}_{self.suffix}.jpg"
        
        return self.output_folder / output_filename
        
    def process_pdf_file(self, pdf_path: Path):
        """Process a single PDF file and extract random pages."""
        logger.info(f"Processing: {pdf_path.name}")
        
        # Get PDF information
        page_count, page_size = self.get_pdf_info(pdf_path)
        
        if page_count == 0:
            logger.warning(f"Skipping {pdf_path.name}: No pages found or error reading PDF")
            return 0
            
        logger.info(f"PDF has {page_count} pages, size: {page_size[0]:.1f}x{page_size[1]:.1f}")
        
        # Select random pages to extract
        selected_pages = self.select_random_pages(page_count)
        
        if not selected_pages:
            logger.warning(f"No pages selected for extraction from {pdf_path.name}")
            return 0
            
        logger.info(f"Extracting pages: {[p+1 for p in selected_pages]}")
        
        extracted_count = 0
        
        for extraction_index, page_num in enumerate(selected_pages):
            try:
                # Extract page as image
                img = self.extract_page_as_image(pdf_path, page_num)
                
                if img is None:
                    continue
                    
                # Generate output filename using extraction order
                output_path = self.generate_output_filename(pdf_path, extraction_index)
                
                # Save the image
                img.save(output_path, "JPEG", quality=self.compress, optimize=True)
                
                logger.info(f"  ✓ Saved page {page_num + 1}: {output_path.name} ({img.size[0]}x{img.size[1]})")
                extracted_count += 1
                
            except Exception as e:
                logger.error(f"Error processing page {page_num + 1} from {pdf_path.name}: {e}")
                
        return extracted_count
        
    def process_all_pdfs(self):
        """Process all found PDF files."""
        pdf_files = self.find_pdf_files()
        
        if not pdf_files:
            logger.warning(f"No PDF files found matching pattern '{self.filter_pattern}' in {self.input_folder}")
            return
            
        total_processed = 0
        total_images = 0
        failed_count = 0
        
        for pdf_path in pdf_files:
            try:
                extracted_count = self.process_pdf_file(pdf_path)
                if extracted_count > 0:
                    total_processed += 1
                    total_images += extracted_count
                else:
                    failed_count += 1
                    
            except Exception as e:
                logger.error(f"Failed to process {pdf_path.name}: {e}")
                failed_count += 1
                
        logger.info(f"\nProcessing complete!")
        logger.info(f"Successfully processed: {total_processed} PDFs")
        logger.info(f"Total images extracted: {total_images}")
        if failed_count > 0:
            logger.warning(f"Failed to process: {failed_count} PDFs")
            
    def run(self):
        """Run the PDF page extraction process."""
        try:
            logger.info("Starting PDF Page Extractor...")
            logger.info(f"Input folder: {self.input_folder}")
            logger.info(f"Filter pattern: '{self.filter_pattern}'")
            logger.info(f"Pages per PDF: {self.pages_count}")
            logger.info(f"Image suffix: '{self.suffix}'")
            logger.info(f"Target height: {self.height}px")
            logger.info(f"DPI: {self.dpi}")
            logger.info(f"JPEG quality: {self.compress}")
            
            self.validate_inputs()
            self.process_all_pdfs()
            
        except Exception as e:
            logger.error(f"Error: {e}")
            sys.exit(1)

# Add missing import
import io

def main():
    parser = argparse.ArgumentParser(
        description="Extract random pages from PDF files and convert to JPG images",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python pdf-page-to-image.py ./pdfs ./images --pages 3
  python pdf-page-to-image.py ./documents ./extracted --pages 5 --filter "*_book.pdf" --suffix extract --dpi 300 --compress 80 --height 800
  python pdf-page-to-image.py "C:/PDFs" "C:/Images" --pages 2 --dpi 200 --compress 90
        """
    )
    
    parser.add_argument(
        "input_folder",
        help="Path to input folder containing PDF files"
    )
    
    parser.add_argument(
        "output_folder",
        help="Path to output folder for extracted images"
    )
    
    parser.add_argument(
        "--pages",
        type=int,
        default=3,
        help="Number of random pages to extract per PDF (default: 3)"
    )
    
    parser.add_argument(
        "--filter",
        type=str,
        default="*.pdf",
        help="Glob pattern to filter PDF files (default: '*.pdf')"
    )
    
    parser.add_argument(
        "--suffix",
        type=str,
        default="page",
        help="Suffix to add to extracted image filenames (default: 'page')"
    )
    
    parser.add_argument(
        "--height",
        type=int,
        default=800,
        help="Target height for output images in pixels (default: 800)"
    )
    
    parser.add_argument(
        "--dpi",
        type=int,
        default=150,
        help="DPI for image extraction (72-300, default: 150)"
    )
    
    parser.add_argument(
        "--compress",
        type=int,
        default=85,
        help="JPEG compression quality (1-100, default: 85)"
    )
    
    args = parser.parse_args()
    
    # Create and run the extractor
    extractor = PDFPageExtractor(
        input_folder=args.input_folder,
        output_folder=args.output_folder,
        pages_count=args.pages,
        filter_pattern=args.filter,
        suffix=args.suffix,
        dpi=args.dpi,
        compress=args.compress,
        height=args.height
    )
    
    extractor.run()

if __name__ == "__main__":
    # python src/pdf-page-to-image.py E:/SiCerdas/perpustakaan/0 E:/SiCerdas/perpustakaan/images/0 --pages 5 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
    main()