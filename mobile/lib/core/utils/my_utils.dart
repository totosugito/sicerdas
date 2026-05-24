import 'dart:io';

class MyUtils {
  static String removeNonAlphanumericChar(String input) {
    return input.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '');
  }

  static bool isFileExist(String path) {
    return File(path).existsSync();
  }
}
