# build app bundle
flutter build appbundle -t lib/main.dart
flutter build appbundle --obfuscate --no-tree-shake-icons --split-debug-info=C:/Temp/ -t lib/main.dart

# build apk
flutter build apk --obfuscate --no-tree-shake-icons --split-debug-info=C:/Temp/ -t lib/main.dart

# run build runner when create json object
dart run build_runner build

# auto create app icon
dart run flutter_launcher_icons

# clean pub-cache and recreate
flutter pub cache clean
flutter pub get

# generate genl10n
dart run slang