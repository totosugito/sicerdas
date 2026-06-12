import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/ui/books/libs/utils/book_utils.dart';

class DownloadDialogResult<T> {
  final T? data;
  final bool isCancelled;

  const DownloadDialogResult({this.data, this.isCancelled = false});
}

class DownloadProgressDialog<T> extends ConsumerStatefulWidget {
  final String title;
  final String? message;
  final Future<T?> Function(
    CancelToken cancelToken,
    ProgressCallback onProgress,
  )
  downloadTask;

  const DownloadProgressDialog({
    super.key,
    required this.title,
    this.message,
    required this.downloadTask,
  });

  @override
  ConsumerState<DownloadProgressDialog<T>> createState() =>
      _DownloadProgressDialogState<T>();

  static Future<DownloadDialogResult<T>?> show<T>(
    BuildContext context, {
    required String title,
    String? message,
    required Future<T?> Function(
      CancelToken cancelToken,
      ProgressCallback onProgress,
    )
    downloadTask,
  }) {
    return showShadDialog<DownloadDialogResult<T>?>(
      context: context,
      barrierDismissible: false,
      builder: (context) => DownloadProgressDialog<T>(
        title: title,
        message: message,
        downloadTask: downloadTask,
      ),
    );
  }
}

class _DownloadProgressDialogState<T>
    extends ConsumerState<DownloadProgressDialog<T>> {
  late final CancelToken _cancelToken;
  double _progress = 0.0;
  int _downloadedBytes = 0;
  int _totalBytes = 0;
  bool _isCompleted = false;

  @override
  void initState() {
    super.initState();
    _cancelToken = CancelToken();
    Future.microtask(() => _startDownload());
  }

  void _startDownload() async {
    try {
      final result = await widget.downloadTask(_cancelToken, (received, total) {
        if (total != -1 && mounted) {
          setState(() {
            _progress = received / total;
            _downloadedBytes = received;
            _totalBytes = total;
          });
        }
      });

      if (!_isCompleted && mounted) {
        _isCompleted = true;
        Navigator.of(
          context,
        ).pop(DownloadDialogResult<T>(data: result, isCancelled: false));
      }
    } catch (_) {
      if (!_isCompleted && mounted) {
        _isCompleted = true;
        Navigator.of(context).pop(DownloadDialogResult<T>(isCancelled: false));
      }
    }
  }

  void _cancelDownload() {
    if (!_isCompleted) {
      _isCompleted = true;
      _cancelToken.cancel();
      Navigator.of(context).pop(DownloadDialogResult<T>(isCancelled: true));
    }
  }

  @override
  void dispose() {
    if (!_isCompleted) {
      _cancelToken.cancel();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final progressPercent = (_progress * 100).toStringAsFixed(0);
    final downloadedText = BookUtils.formatFileSize(_downloadedBytes);
    final totalText = BookUtils.formatFileSize(_totalBytes);

    return PopScope(
      canPop: false,
      child: ShadDialog(
        useSafeArea: false,
        constraints: const BoxConstraints(maxWidth: 340),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.file_download_outlined,
                size: 28,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              widget.title,
              style: theme.textTheme.large.copyWith(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Text(
              widget.message ?? l10n.books.downloadStarted,
              style: theme.textTheme.muted.copyWith(
                fontSize: 13,
                color: isDark ? Colors.white70 : Colors.black54,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            // Progress Bar
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: _progress,
                backgroundColor: theme.colorScheme.muted,
                valueColor: AlwaysStoppedAnimation<Color>(
                  theme.colorScheme.primary,
                ),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 8),
            // Progress Stats
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '$progressPercent%',
                  style: theme.textTheme.small.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (_totalBytes > 0)
                  Text(
                    '$downloadedText / $totalText',
                    style: theme.textTheme.muted.copyWith(fontSize: 11),
                  ),
              ],
            ),
            const SizedBox(height: 24),
            ShadButton.outline(
              width: double.infinity,
              onPressed: _cancelDownload,
              child: Text(
                l10n.common.cancel,
                style: TextStyle(color: theme.colorScheme.mutedForeground),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
