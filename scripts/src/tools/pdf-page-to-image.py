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

import concurrent.futures
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
    def __init__(self, input_folder, output_folder, pages_count=6, filter_pattern="*.pdf", suffix="lg", dpi=300, compress=80, height=800, include_first_page=True, max_workers=8):
        """
        Initialize the PDFPageExtractor.
        
        Args:
            input_folder (str): Path to input folder containing PDF files
            output_folder (str): Path to output folder for extracted images
            pages_count (int): Number of random pages to extract per PDF (default: 6)
            filter_pattern (str): Glob filter pattern to find PDF files (default: "*.pdf")
            suffix (str): Suffix to add to extracted image filenames (default: "lg")
            dpi (int): DPI for image extraction (default: 300)
            compress (int): JPEG quality/compression level (1-100, default: 80)
            height (int): Target height for output images in pixels (default: 800)
            max_workers (int): Number of worker threads for parallel processing (default: 8)
        """
        self.input_folder = Path(input_folder)
        self.output_folder = Path(output_folder)
        self.pages_count = max(1, pages_count)
        self.filter_pattern = filter_pattern
        self.suffix = suffix
        self.dpi = max(72, min(300, dpi))  # Ensure DPI is between 72-300
        self.compress = max(1, min(100, compress))  # Ensure value is between 1-100
        self.height = max(100, height)  # Ensure minimum height of 100px
        self.include_first_page = include_first_page
        self.max_workers = max(1, max_workers)
        
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
            
        final_pages = set()
        
        # Decide the pool of pages to select from
        if self.include_first_page:
            # Always include the first page
            final_pages.add(0)
            
            # Select random pages from the remaining pages (1 to total_pages-1)
            if total_pages > 1:
                # The pool of random pages starts from index 1 due to include_first_page
                available_pages = range(1, total_pages)
                
                # Calculate how many more pages we need (subtracting the first page we already added)
                needed = max(0, self.pages_count)
                
                # We can't extract more than available
                count_to_extract = min(needed, len(available_pages))
                
                if count_to_extract > 0:
                    final_pages.update(random.sample(available_pages, count_to_extract))
        else:
            # Normal behavior: select from all pages (0 to total_pages-1)
            count_to_extract = min(self.pages_count, total_pages)
            
            if count_to_extract == total_pages:
                final_pages.update(range(total_pages))
            else:
                final_pages.update(random.sample(range(total_pages), count_to_extract))
            
        return sorted(list(final_pages))
        
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
        
        # Create subdirectory based on first word
        pdf_output_dir = self.output_folder / first_word
        pdf_output_dir.mkdir(parents=True, exist_ok=True)
        
        # Format: xxxx_0001_suffix.jpg (extraction_index is 0-indexed, so add 1 for display)
        extraction_number = f"{extraction_index:04d}"
        output_filename = f"{first_word}_{extraction_number}_{self.suffix}.jpg"
        
        return pdf_output_dir / output_filename
        
    def process_pdf_file(self, pdf_path: Path):
        """Process a single PDF file and extract random pages."""
        # Get PDF information
        page_count, page_size = self.get_pdf_info(pdf_path)
        
        if page_count == 0:
            logger.warning(f"Skipping {pdf_path.name}: No pages found or error reading PDF")
            return 0
            
        # Select random pages to extract
        selected_pages = self.select_random_pages(page_count)
        
        if not selected_pages:
            logger.warning(f"No pages selected for extraction from {pdf_path.name}")
            return 0
            
        extracted_count = 0       
        for extraction_index, page_num in enumerate(selected_pages):
            try:
                # Extract page as image
                img = self.extract_page_as_image(pdf_path, page_num)
                
                if img is None:
                    logger.warning(f"Skipping page {page_num + 1} from {pdf_path.name}: No image extracted")
                    continue
                    
                # Generate output filename using extraction order
                output_path = self.generate_output_filename(pdf_path, extraction_index)
                
                # Save the image
                img.save(output_path, "JPEG", quality=self.compress, optimize=True)
                
                extracted_count += 1
                
            except Exception as e:
                logger.error(f"Error processing page {page_num + 1} from {pdf_path.name}: {e}")
                
        return extracted_count
        
    def process_all_pdfs(self):
        """Process all found PDF files using multi-threading."""
        pdf_files = self.find_pdf_files()
        
        if not pdf_files:
            logger.warning(f"No PDF files found matching pattern '{self.filter_pattern}' in {self.input_folder}")
            return
            
        total_processed = 0
        total_images = 0
        failed_count = 0
        
        logger.info(f"Processing {len(pdf_files)} PDFs with {self.max_workers} threads...")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Create a dictionary to map futures to pdf paths for error reporting
            future_to_pdf = {executor.submit(self.process_pdf_file, pdf): pdf for pdf in pdf_files}
            
            for i, future in enumerate(concurrent.futures.as_completed(future_to_pdf)):
                pdf_path = future_to_pdf[future]
                try:
                    extracted_count = future.result()
                    if extracted_count > 0:
                        total_processed += 1
                        total_images += extracted_count
                    else:
                        failed_count += 1
                except Exception as e:
                    logger.error(f"Failed to process {pdf_path.name}: {e}")
                    failed_count += 1
                
                # Progress logging every 10 files
                if (i + 1) % 10 == 0:
                    logger.info(f"Processed {i + 1}/{len(pdf_files)} PDFs")

        if failed_count > 0:
            logger.warning(f"Failed to process : {failed_count} PDFs")

        logger.info(f"--------------------------------------------------------------")
        logger.info(f"Successfully processed {total_processed}/{len(pdf_files)} PDFs")
        logger.info(f"Total images extracted: {total_images}")
        logger.info(f"Failed to process: {failed_count} PDFs")
        logger.info(f"--------------------------------------------------------------")
            
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
            logger.info(f"Include first page: {self.include_first_page}")
            logger.info(f"Max workers: {self.max_workers}")
            
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
        default=6,
        help="Number of random pages to extract per PDF (default: 6)"
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
        default="lg",
        help="Suffix to add to extracted image filenames (default: 'lg')"
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
        default=300,
        help="DPI for image extraction (72-300, default: 300)"
    )
    
    parser.add_argument(
        "--compress",
        type=int,
        default=80,
        help="JPEG compression quality (1-100, default: 80)"
    )

    parser.add_argument(
        "--include-first-page",
        type=bool,
        default=True,
        help="Always include the first page in the extracted images"
    )

    parser.add_argument(
        "--threads",
        type=int,
        default=8,
        help="Number of threads to use for processing (default: 8)"
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
        height=args.height,
        include_first_page=args.include_first_page,
        max_workers=args.threads
    )
    
    extractor.run()

if __name__ == "__main__":
    # python src/tools/pdf-page-to-image.py E:/Cloud/SiCerdas/perpustakaan/0 E:/Cloud/SiCerdas/perpustakaan/pages/0/lg --pages 5 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
    main()