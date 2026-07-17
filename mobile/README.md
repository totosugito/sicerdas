# build app bundle
flutter build appbundle -t lib/main.dart
flutter build appbundle --obfuscate --no-tree-shake-icons --split-debug-info=C:/Temp/ -t lib/main.dart

# build apk
flutter build apk --obfuscate --no-tree-shake-icons --split-debug-info=C:/Temp/ -t lib/main.dart

# run build runner when create json object
dart run build_runner build --delete-conflicting-outputs

# auto create app icon
# Add padding to the logo image so it fits the Android Adaptive Icon safe zone (scales non-transparent content to 80% of canvas)
python3 -c "from PIL import Image; img = Image.open('assets/images/ic_launcher.png').convert('RGBA'); bbox = img.getbbox(); cropped = img.crop(bbox) if bbox else img; scale = 205 / max(cropped.size); resized = cropped.resize((int(cropped.width * scale), int(cropped.height * scale)), Image.Resampling.LANCZOS); canvas = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); canvas.paste(resized, ((256 - resized.width) // 2, (256 - resized.height) // 2), resized); canvas.save('assets/images/ic_launcher.png')"

dart run flutter_launcher_icons

# clean pub-cache and recreate
flutter pub cache clean
flutter pub get

# generate genl10n
dart run slang