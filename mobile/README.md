# build app bundle
flutter build appbundle -t lib/main.dart
flutter build appbundle --obfuscate --no-tree-shake-icons --split-debug-info=C:/Temp/ -t lib/main.dart

# build apk
flutter build apk --obfuscate --no-tree-shake-icons --split-debug-info=C:/Temp/ -t lib/main.dart

# run build runner when create json object
dart run build_runner build --delete-conflicting-outputs

# isar generate
dart run build_runner build

# auto create app icon
dart run flutter_launcher_icons

# clean pub-cache and recreate
flutter pub cache clean
flutter pub get

# generate genl10n
# 1. Merge split locales files (under lib/l10n/src) into main ARB files
dart tool/merge_l10n.dart
# 2. Run standard Flutter localization generator
flutter gen-l10n