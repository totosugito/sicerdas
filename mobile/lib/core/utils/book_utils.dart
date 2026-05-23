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

  static String getBookSamplePageUrl({required String baseUrl, required int bookId, required int pageIndex, String size = 'xs', int maxChar = 4}) {
    final dirName = (bookId / 1000).floor();
    final fileId = bookId.toString().padLeft(maxChar, '0');
    final pageStr = pageIndex.toString().padLeft(4, '0');

    return '$baseUrl/book/images/$dirName/$size/$fileId/${fileId}_${pageStr}_$size.jpg';
  }

  static String getBookPdfUrl({required String baseUrl, required int bookId, int maxChar = 4}) {
    // This part involves MD5 in backend, we might need a similar logic if needed
    // But for now focusing on covers as requested
    return '';
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
