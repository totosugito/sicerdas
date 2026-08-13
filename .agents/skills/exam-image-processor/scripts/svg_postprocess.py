import sys
import re
import xml.etree.ElementTree as ET

def process_svg(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Pastikan tag <text> memiliki atribut stroke/halo untuk keterbacaan
        def add_text_stroke(match):
            tag = match.group(0)
            if 'stroke="rgba' not in tag:
                return tag[:-1] + ' stroke="rgba(255,255,255,0.9)" stroke-width="4" paint-order="stroke fill" stroke-linejoin="round">'
            return tag
        
        content = re.sub(r'<text\b[^>]*>', add_text_stroke, content)

        # 2. Pastikan ada background rect putih
        if '<rect width="100%" height="100%" fill="#ffffff"' not in content and '<rect x=' not in content:
            # Cari defs atau elemen pertama setelah tag pembuka <svg>
            content = re.sub(r'(<svg[^>]*>)', r'\1\n  <rect width="100%" height="100%" fill="#ffffff" rx="8" />', content, count=1)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"✅ Berhasil memproses {filepath}: Halo teks & latar belakang diterapkan.")
    except Exception as e:
        print(f"❌ Gagal memproses {filepath}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Penggunaan: python svg_postprocess.py <path_ke_file_svg>")
        sys.exit(1)
    
    process_svg(sys.argv[1])
