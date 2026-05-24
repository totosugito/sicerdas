import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import '../database/database.dart';
import 'my_utils.dart';

class BookUtils {
  static String getBookCoverUrl({
    required String baseUrl,
    required int bookId,
    String size = 'xs', // 'xs' or 'lg'
    int maxChar = 4,
  }) {
    final dirName = (bookId / 1000).floor();
    final fileId = bookId.toString().padLeft(maxChar, '0');

    return '$baseUrl/book/images/$dirName/$size/$fileId/${fileId}_0000_$size.jpg';
  }

  static String getBookSamplePageUrl({
    required String baseUrl,
    required int bookId,
    required int pageIndex,
    String size = 'xs',
    int maxChar = 4,
  }) {
    final dirName = (bookId / 1000).floor();
    final fileId = bookId.toString().padLeft(maxChar, '0');
    final pageStr = pageIndex.toString().padLeft(4, '0');

    return '$baseUrl/book/images/$dirName/$size/$fileId/${fileId}_${pageStr}_$size.jpg';
  }

  static String formatFileSize(int bytes) {
    if (bytes <= 0) return '0 B';
    const suffixes = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i = 0;
    double size = bytes.toDouble();
    while (size >= 1024 && i < suffixes.length - 1) {
      size /= 1024;
      i++;
    }
    return '${size.toStringAsFixed(1)} ${suffixes[i]}';
  }
}

extension BookExtension on Book {
  String getAutoFileNameFromTitle() {
    final filePrefix = bookId.toString().padLeft(4, "0");
    final cleanTitle = MyUtils.removeNonAlphanumericChar(title);
    final textTitle = cleanTitle.length < 50 ? cleanTitle : cleanTitle.substring(0, 50);
    return "${filePrefix}_$textTitle";
  }

  Future<String> getBookRootDir() async {
    final dataDir = await getExternalStorageDirectory();
    final parentPath = dataDir != null
        ? dataDir.path
        : (await getApplicationDocumentsDirectory()).path;
    final booksDir = Directory(p.join(parentPath, 'BSE', 'Books'));
    if (!await booksDir.exists()) {
      await booksDir.create(recursive: true);
    }
    return "${booksDir.path}${Platform.pathSeparator}";
  }

  Future<String> getLocalFileName({String ext = '.pdf'}) async {
    final bookRootDir = await getBookRootDir();
    if (bookRootDir.isEmpty) {
      return "";
    }

    final fileName = File("$bookRootDir${getAutoFileNameFromTitle()}$ext");
    return fileName.path;
  }

  Future<bool> isLocalFileExist() async {
    final fileName = await getLocalFileName();
    return MyUtils.isFileExist(fileName);
  }
}
