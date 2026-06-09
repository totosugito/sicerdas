import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/utils/toast_utils.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';

class PdfViewerScreen extends StatefulWidget {
  final String filePath;
  final String title;

  const PdfViewerScreen({
    super.key,
    required this.filePath,
    required this.title,
  });

  @override
  State<PdfViewerScreen> createState() => _PdfViewerScreenState();
}

class _PdfViewerScreenState extends State<PdfViewerScreen> {
  late PdfViewerController _pdfViewerController;
  late PdfTextSearchResult _searchResult;
  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();
  int _currentPage = 1;
  int _totalPages = 0;
  OverlayEntry? _overlayEntry;

  @override
  void initState() {
    super.initState();
    _pdfViewerController = PdfViewerController();
    _searchResult = PdfTextSearchResult();
  }

  @override
  void dispose() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    _pdfViewerController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _showContextMenu(
    BuildContext context,
    PdfTextSelectionChangedDetails details,
  ) {
    final l10n = AppLocalizations.of(context)!;
    final OverlayState overlayState = Overlay.of(context);
    _overlayEntry = OverlayEntry(
      builder: (context) {
        final theme = ShadTheme.of(context);

        return Positioned(
          top: details.globalSelectedRegion!.top - 60,
          left:
              (details.globalSelectedRegion!.left +
                      details.globalSelectedRegion!.right) /
                  2 -
              60,
          child: Material(
            color: Colors.transparent,
            child: Container(
              decoration: BoxDecoration(
                color: theme.colorScheme.card,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: theme.colorScheme.border, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.15),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ShadButton.ghost(
                    width: 44,
                    height: 36,
                    padding: EdgeInsets.zero,
                    onPressed: () {
                      Clipboard.setData(
                        ClipboardData(text: details.selectedText ?? ''),
                      );
                      _pdfViewerController.clearSelection();
                      ToastUtils.showSuccess(
                        context,
                        title: l10n.successTitle,
                        message: l10n.textCopied,
                      );
                    },
                    child: Icon(
                      Icons.copy,
                      size: 16,
                      color: theme.colorScheme.foreground,
                    ),
                  ),
                  Container(
                    width: 1,
                    height: 24,
                    color: theme.colorScheme.border,
                  ),
                  ShadButton.ghost(
                    width: 44,
                    height: 36,
                    padding: EdgeInsets.zero,
                    onPressed: () {
                      _pdfViewerController.clearSelection();
                    },
                    child: Icon(
                      Icons.close,
                      size: 16,
                      color: theme.colorScheme.foreground,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
    overlayState.insert(_overlayEntry!);
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: l10n.searchText,
                  border: InputBorder.none,
                ),
                style: theme.textTheme.p.copyWith(
                  color: theme.colorScheme.foreground,
                ),
                onSubmitted: (value) {
                  if (value.isNotEmpty) {
                    _searchResult = _pdfViewerController.searchText(value);
                    if (_searchResult.totalInstanceCount == 0) {
                      ToastUtils.showInfo(
                        context,
                        title: l10n.infoTitle,
                        message: l10n.textNotFound,
                      );
                    }
                    setState(() {});
                  }
                },
              )
            : Text(
                widget.title,
                style: theme.textTheme.large.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
        backgroundColor: theme.colorScheme.background,
        elevation: 0,
        iconTheme: IconThemeData(color: theme.colorScheme.foreground),
        actions: [
          if (_isSearching) ...[
            IconButton(
              icon: const Icon(Icons.navigate_before),
              onPressed: () {
                _searchResult.previousInstance();
              },
            ),
            IconButton(
              icon: const Icon(Icons.navigate_next),
              onPressed: () {
                _searchResult.nextInstance();
              },
            ),
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () {
                setState(() {
                  _isSearching = false;
                  _searchController.clear();
                  _searchResult.clear();
                });
              },
            ),
          ] else ...[
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {
                setState(() {
                  _isSearching = true;
                });
              },
            ),
            IconButton(
              icon: const Icon(Icons.zoom_out),
              onPressed: () {
                _pdfViewerController.zoomLevel =
                    (_pdfViewerController.zoomLevel - 0.25).clamp(1.0, 3.0);
              },
            ),
            IconButton(
              icon: const Icon(Icons.zoom_in),
              onPressed: () {
                _pdfViewerController.zoomLevel =
                    (_pdfViewerController.zoomLevel + 0.25).clamp(1.0, 3.0);
              },
            ),
          ],
        ],
      ),
      body: SfPdfViewer.file(
        File(widget.filePath),
        controller: _pdfViewerController,
        canShowTextSelectionMenu:
            false, // Disable native menu to show custom contextual toolbar
        canShowScrollHead: true,
        canShowScrollStatus: true,
        onDocumentLoaded: (PdfDocumentLoadedDetails details) {
          setState(() {
            _totalPages = details.document.pages.count;
          });
        },
        onPageChanged: (PdfPageChangedDetails details) {
          setState(() {
            _currentPage = details.newPageNumber;
          });
        },
        onTextSelectionChanged: (PdfTextSelectionChangedDetails details) {
          if (_overlayEntry != null) {
            _overlayEntry!.remove();
            _overlayEntry = null;
          }
          if (details.selectedText != null) {
            _showContextMenu(context, details);
          }
        },
      ),
      bottomNavigationBar: _totalPages > 0
          ? Container(
              height: 56,
              decoration: BoxDecoration(
                color: theme.colorScheme.card,
                border: Border(
                  top: BorderSide(color: theme.colorScheme.border, width: 0.5),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.first_page),
                    onPressed: _currentPage > 1
                        ? () => _pdfViewerController.jumpToPage(1)
                        : null,
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_left),
                    onPressed: _currentPage > 1
                        ? () => _pdfViewerController.previousPage()
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '$_currentPage / $_totalPages',
                    style: theme.textTheme.small.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 12),
                  IconButton(
                    icon: const Icon(Icons.chevron_right),
                    onPressed: _currentPage < _totalPages
                        ? () => _pdfViewerController.nextPage()
                        : null,
                  ),
                  IconButton(
                    icon: const Icon(Icons.last_page),
                    onPressed: _currentPage < _totalPages
                        ? () => _pdfViewerController.jumpToPage(_totalPages)
                        : null,
                  ),
                ],
              ),
            )
          : null,
    );
  }
}
