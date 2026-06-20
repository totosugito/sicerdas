import 'dart:io';
import 'package:intl/intl.dart';

class MyUtils {
  static String removeNonAlphanumericChar(String input) {
    return input.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '');
  }

  static bool isFileExist(String path) {
    return File(path).existsSync();
  }

  static String formatTime(int timestamp) {
    final dt = DateTime.fromMillisecondsSinceEpoch(timestamp);
    return DateFormat('HH:mm').format(dt);
  }

  static String formatDateId(int dateId) {
    final year = dateId ~/ 10000;
    final month = (dateId % 10000) ~/ 100;
    final day = dateId % 100;
    final dt = DateTime(year, month, day);
    return DateFormat('d MMM yyyy').format(dt);
  }

  static String formatDateTime(int timestamp) {
    final dt = DateTime.fromMillisecondsSinceEpoch(timestamp);
    return DateFormat('d MMM yyyy, HH:mm').format(dt);
  }
}
