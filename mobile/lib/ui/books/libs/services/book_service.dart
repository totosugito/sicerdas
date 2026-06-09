import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bse/core/network/api_endpoints.dart';
import 'package:bse/core/providers/dio_provider.dart';
import 'package:bse/core/database/database.dart';
import '../utils/book_utils.dart';

final bookServiceProvider = Provider<BookService>((ref) {
  final dio = ref.watch(dioProvider);
  return BookService(dio);
});

class BookService {
  final Dio _dio;

  BookService(this._dio);

  /// Fetch simple book details and retrieve the PDF URL.
  /// Uses totalPages as the "page" query parameter for public security check.
  Future<String?> getBookPdfUrl({
    required int bookId,
    required int totalPages,
  }) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.bookInfo,
        queryParameters: {'bookId': bookId, 'page': totalPages},
      );

      if (response.data['success'] == true) {
        return response.data['data']['pdf'] as String;
      }
    } catch (e) {
      // Error handling/logging
    }
    return null;
  }

  /// Sends a post request to increment download statistics.
  /// Works for both logged-in and guest users.
  Future<bool> updateDownloadStats({required int bookId}) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.updateDownload,
        data: {'bookId': bookId},
      );
      return response.data['success'] == true;
    } catch (e) {
      // Error handling/logging
      return false;
    }
  }

  /// Downloads the book PDF from S3 and registers the download stat increment.
  Future<File?> downloadBookPdf({
    required Book book,
    required String pdfUrl,
    ProgressCallback? onProgress,
    CancelToken? cancelToken,
  }) async {
    try {
      final localFilePath = await book.getLocalFileName();
      final localFile = File(localFilePath);

      final response = await _dio.download(
        pdfUrl,
        localFile.path,
        onReceiveProgress: onProgress,
        cancelToken: cancelToken,
      );

      if (response.statusCode == 200) {
        // Increment download counter
        await updateDownloadStats(bookId: book.bookId);
        return localFile;
      }
    } catch (e) {
      // Error handling/logging
      // Delete temporary/incomplete download file
      try {
        final localFilePath = await book.getLocalFileName();
        final localFile = File(localFilePath);
        if (await localFile.exists()) {
          await localFile.delete();
        }
      } catch (_) {}
    }
    return null;
  }
}
