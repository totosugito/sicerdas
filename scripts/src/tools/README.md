### RUN PDF page to image
```bash
python src/tools/pdf-page-to-image.py F:/Data/bse/perpustakaan/0 F:/Data/bse/perpustakaan/pages/0/lg --pages 6 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
python src/tools/pdf-page-to-image.py F:/Data/bse/perpustakaan/1 F:/Data/bse/perpustakaan/pages/1/lg --pages 6 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
python src/tools/pdf-page-to-image.py F:/Data/bse/perpustakaan/2 F:/Data/bse/perpustakaan/pages/2/lg --pages 6 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
python src/tools/pdf-page-to-image.py F:/Data/bse/perpustakaan/3 F:/Data/bse/perpustakaan/pages/3/lg --pages 6 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
python src/tools/pdf-page-to-image.py F:/Data/bse/perpustakaan/4 F:/Data/bse/perpustakaan/pages/4/lg --pages 6 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
python src/tools/pdf-page-to-image.py F:/Data/bse/perpustakaan/5 F:/Data/bse/perpustakaan/pages/5/lg --pages 6 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
python src/tools/pdf-page-to-image.py F:/Data/bse/perpustakaan/6 F:/Data/bse/perpustakaan/pages/6/lg --pages 6 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
python src/tools/pdf-page-to-image.py F:/Data/bse/perpustakaan/7 F:/Data/bse/perpustakaan/pages/7/lg --pages 6 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
python src/tools/pdf-page-to-image.py F:/Data/bse/perpustakaan/8 F:/Data/bse/perpustakaan/pages/8/lg --pages 6 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
python src/tools/pdf-page-to-image.py F:/Data/bse/perpustakaan/9 F:/Data/bse/perpustakaan/pages/9/lg --pages 6 --filter "*.pdf" --suffix lg --dpi 300 --compress 80 --height 800
```

### RUN Image resize
```bash
python ./src/tools/image-resizer.py F:/Data/bse/perpustakaan/pages/0/lg F:/Data/bse/perpustakaan/pages/0/xs --height 200 --filter "*_lg.jpg" --original lg --replacement xs --compress 80
python ./src/tools/image-resizer.py F:/Data/bse/perpustakaan/pages/1/lg F:/Data/bse/perpustakaan/pages/1/xs --height 200 --filter "*_lg.jpg" --original lg --replacement xs --compress 80
python ./src/tools/image-resizer.py F:/Data/bse/perpustakaan/pages/2/lg F:/Data/bse/perpustakaan/pages/2/xs --height 200 --filter "*_lg.jpg" --original lg --replacement xs --compress 80
python ./src/tools/image-resizer.py F:/Data/bse/perpustakaan/pages/3/lg F:/Data/bse/perpustakaan/pages/3/xs --height 200 --filter "*_lg.jpg" --original lg --replacement xs --compress 80
python ./src/tools/image-resizer.py F:/Data/bse/perpustakaan/pages/4/lg F:/Data/bse/perpustakaan/pages/4/xs --height 200 --filter "*_lg.jpg" --original lg --replacement xs --compress 80
python ./src/tools/image-resizer.py F:/Data/bse/perpustakaan/pages/5/lg F:/Data/bse/perpustakaan/pages/5/xs --height 200 --filter "*_lg.jpg" --original lg --replacement xs --compress 80
python ./src/tools/image-resizer.py F:/Data/bse/perpustakaan/pages/6/lg F:/Data/bse/perpustakaan/pages/6/xs --height 200 --filter "*_lg.jpg" --original lg --replacement xs --compress 80
python ./src/tools/image-resizer.py F:/Data/bse/perpustakaan/pages/7/lg F:/Data/bse/perpustakaan/pages/7/xs --height 200 --filter "*_lg.jpg" --original lg --replacement xs --compress 80
python ./src/tools/image-resizer.py F:/Data/bse/perpustakaan/pages/8/lg F:/Data/bse/perpustakaan/pages/8/xs --height 200 --filter "*_lg.jpg" --original lg --replacement xs --compress 80
python ./src/tools/image-resizer.py F:/Data/bse/perpustakaan/pages/9/lg F:/Data/bse/perpustakaan/pages/9/xs --height 200 --filter "*_lg.jpg" --original lg --replacement xs --compress 80
```
