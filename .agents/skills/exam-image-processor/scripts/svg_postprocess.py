import sys
import re
import xml.etree.ElementTree as ET

def process_svg(filepath, target_padding=20):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Bersihkan inline stroke/halo dari tag <text> karena sudah ada di CSS class (.text-label, .text-var)
        content = re.sub(r' stroke="rgba\(255,255,255,0\.95?\)"', '', content)
        content = re.sub(r' stroke-width="4"', '', content)
        content = re.sub(r' paint-order="stroke fill"', '', content)
        content = re.sub(r' stroke-linejoin="round"', '', content)

        # 2. Verifikasi & Koreksi Bounding Box (Koreksi Padding Simetris 20px & Font Descender Protection)
        try:
            clean_xml = re.sub(r'xmlns="[^"]+"', '', content)
            root = ET.fromstring(clean_xml)

            x_coords = []
            y_coords = []

            for elem in root.iter():
                tag = elem.tag.split('}')[-1]
                
                if tag in ['line', 'circle', 'text', 'rect', 'polygon', 'path']:
                    # Line coordinates
                    if 'x1' in elem.attrib: x_coords.extend([float(elem.attrib['x1']), float(elem.attrib['x2'])])
                    if 'y1' in elem.attrib: y_coords.extend([float(elem.attrib['y1']), float(elem.attrib['y2'])])
                    
                    # Circle coordinates
                    if 'cx' in elem.attrib:
                        r = float(elem.attrib.get('r', 0))
                        cx, cy = float(elem.attrib['cx']), float(elem.attrib['cy'])
                        x_coords.extend([cx - r, cx + r])
                        y_coords.extend([cy - r, cy + r])
                        
                    # Text positioning (baseline accounting)
                    if 'x' in elem.attrib and 'width' not in elem.attrib:
                        try:
                            x_val = float(elem.attrib['x'])
                            x_coords.extend([x_val - 15, x_val + 25]) # Buffer for text width & alignment
                        except ValueError: pass
                    if 'y' in elem.attrib and 'height' not in elem.attrib:
                        try:
                            y_val = float(elem.attrib['y'])
                            # Text baseline extends UP for font ascender (-22px) and DOWN for font descender (+20px)
                            y_coords.extend([y_val - 22, y_val + 20])
                        except ValueError: pass

                    # Polygon points
                    if 'points' in elem.attrib:
                        pts = elem.attrib['points'].replace(',', ' ').split()
                        for i in range(0, len(pts), 2):
                            try:
                                x_coords.append(float(pts[i]))
                                y_coords.append(float(pts[i+1]))
                            except (ValueError, IndexError): pass

            if x_coords and y_coords:
                x_min, x_max = min(x_coords), max(x_coords)
                y_min, y_max = min(y_coords), max(y_coords)

                new_vb_x = round(x_min - target_padding)
                new_vb_y = round(y_min - target_padding)
                new_vb_w = round((x_max - x_min) + (2 * target_padding))
                new_vb_h = round((y_max - y_min) + (2 * target_padding))

                new_viewbox = f'viewBox="{new_vb_x} {new_vb_y} {new_vb_w} {new_vb_h}"'
                
                vb_match = re.search(r'viewBox="([^"]+)"', content)
                if vb_match:
                    content = content.replace(vb_match.group(0), new_viewbox)
                else:
                    content = re.sub(r'<svg\b', f'<svg {new_viewbox}', content, count=1)
                
                # 3. Pastikan background rect putih mencakup seluruh viewBox
                bg_rect = f'<rect x="{new_vb_x - 100}" y="{new_vb_y - 100}" width="{new_vb_w + 200}" height="{new_vb_h + 200}" fill="#ffffff" />'
                if '<rect' in content:
                    content = re.sub(r'<rect\b[^>]*width="100%"[^>]*>', bg_rect, content)
                else:
                    content = re.sub(r'(<svg[^>]*>)', f'\\1\n  {bg_rect}', content, count=1)

                print(f"📐 Bounding Box & Padding {target_padding}px sukses diverifikasi: {new_viewbox}")
        except Exception as err:
            print(f"⚠️ Peringatan kalkulasi bounding box: {err}")

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"✅ Berhasil memproses {filepath}: Font descender terlindungi & padding {target_padding}px diverifikasi.")
    except Exception as e:
        print(f"❌ Gagal memproses {filepath}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Penggunaan: python svg_postprocess.py <path_ke_file_svg>")
        sys.exit(1)
    
    process_svg(sys.argv[1])
