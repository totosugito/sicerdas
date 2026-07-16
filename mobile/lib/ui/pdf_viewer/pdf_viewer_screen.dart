import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/utils/toast_utils.dart';
import 'package:bse/i18n/strings.g.dart';
import 'widgets/pdf_context_menu.dart';
import 'widgets/pdf_top_toolbar.dart';
import 'widgets/pdf_search_bar_field.dart';

class PdfViewerScreen extends StatefulWidget {
  final String filePath;
  final String title;
  final bool exitOnClose;

  const PdfViewerScreen({
    super.key,
    required this.filePath,
    required this.title,
    this.exitOnClose = false,
  });

  @override
  State<PdfViewerScreen> createState() => _PdfViewerScreenState();
}

class _PdfViewerScreenState extends State<PdfViewerScreen> {
  late PdfViewerController _pdfViewerController;
  late PdfTextSearchResult _searchResult;
  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();
  int _totalPages = 0;
  OverlayEntry? _overlayEntry;
  final GlobalKey<SfPdfViewerState> _pdfViewerKey =
      GlobalKey<SfPdfViewerState>();
  PdfInteractionMode _interactionMode = PdfInteractionMode.selection;
  bool _isAnnotationMode = false;
  bool _isSettingsMode = false;
  PdfPageLayoutMode _pageLayoutMode = PdfPageLayoutMode.continuous;
  PdfScrollDirection _scrollDirection = PdfScrollDirection.vertical;

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
    final l10n = Translations.of(context);
    final OverlayState overlayState = Overlay.of(context);
    _overlayEntry = OverlayEntry(
      builder: (context) {
        return Positioned(
          top: details.globalSelectedRegion!.top - 60,
          left:
              (details.globalSelectedRegion!.left +
                      details.globalSelectedRegion!.right) /
                  2 -
              135,
          child: PdfContextMenu(
            onCopy: () {
              Clipboard.setData(
                ClipboardData(text: details.selectedText ?? ''),
              );
              _pdfViewerController.clearSelection();
              ToastUtils.showSuccess(
                context,
                title: l10n.common.successTitle,
                message: l10n.common.textCopied,
              );
            },
            onHighlight: () {
              final selectedLines = _pdfViewerKey.currentState
                  ?.getSelectedTextLines();
              if (selectedLines != null && selectedLines.isNotEmpty) {
                _pdfViewerController.addAnnotation(
                  HighlightAnnotation(textBoundsCollection: selectedLines),
                );
              }
              _pdfViewerController.clearSelection();
            },
            onUnderline: () {
              final selectedLines = _pdfViewerKey.currentState
                  ?.getSelectedTextLines();
              if (selectedLines != null && selectedLines.isNotEmpty) {
                _pdfViewerController.addAnnotation(
                  UnderlineAnnotation(textBoundsCollection: selectedLines),
                );
              }
              _pdfViewerController.clearSelection();
            },
            onStrikethrough: () {
              final selectedLines = _pdfViewerKey.currentState
                  ?.getSelectedTextLines();
              if (selectedLines != null && selectedLines.isNotEmpty) {
                _pdfViewerController.addAnnotation(
                  StrikethroughAnnotation(textBoundsCollection: selectedLines),
                );
              }
              _pdfViewerController.clearSelection();
            },
            onSquiggly: () {
              final selectedLines = _pdfViewerKey.currentState
                  ?.getSelectedTextLines();
              if (selectedLines != null && selectedLines.isNotEmpty) {
                _pdfViewerController.addAnnotation(
                  SquigglyAnnotation(textBoundsCollection: selectedLines),
                );
              }
              _pdfViewerController.clearSelection();
            },
            onClose: () {
              _pdfViewerController.clearSelection();
            },
          ),
        );
      },
    );
    overlayState.insert(_overlayEntry!);
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);

    return PopScope(
      canPop: !widget.exitOnClose,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (widget.exitOnClose) {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: _isSearching
              ? PdfSearchBarField(
                  controller: _searchController,
                  placeholder: l10n.common.searchText,
                  onSubmitted: (value) {
                    if (value.isNotEmpty) {
                      _searchResult = _pdfViewerController.searchText(value);
                      if (_searchResult.totalInstanceCount == 0) {
                        ToastUtils.showInfo(
                          context,
                          title: l10n.common.infoTitle,
                          message: l10n.common.textNotFound,
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
            ],
          ],
        ),
        body: Column(
          children: [
            if (_totalPages > 0)
              PdfTopToolbar(
                controller: _pdfViewerController,
                interactionMode: _interactionMode,
                isAnnotationMode: _isAnnotationMode,
                isSettingsMode: _isSettingsMode,
                pageLayoutMode: _pageLayoutMode,
                scrollDirection: _scrollDirection,
                onTap: (action) {
                  if (action == 'Search') {
                    setState(() {
                      _isSearching = true;
                    });
                  } else if (action == 'Bookmarks') {
                    _pdfViewerKey.currentState?.openBookmarkView();
                  } else if (action == 'Pan mode') {
                    setState(() {
                      _interactionMode =
                          _interactionMode == PdfInteractionMode.selection
                              ? PdfInteractionMode.pan
                              : PdfInteractionMode.selection;
                    });
                  } else if (action == 'Annotations') {
                    setState(() {
                      _isAnnotationMode = !_isAnnotationMode;
                      if (_isAnnotationMode) {
                        _isSettingsMode = false;
                      }
                      _pdfViewerController.annotationMode = _isAnnotationMode
                          ? PdfAnnotationMode.highlight
                          : PdfAnnotationMode.none;
                    });
                  } else if (action == 'View settings') {
                    setState(() {
                      _isSettingsMode = !_isSettingsMode;
                      if (_isSettingsMode) {
                        _isAnnotationMode = false;
                        _pdfViewerController.annotationMode =
                            PdfAnnotationMode.none;
                      }
                    });
                  } else if (action.toString().startsWith('PageLayoutMode:')) {
                    final layout = action.toString().split(':')[1];
                    setState(() {
                      if (layout == 'continuous') {
                        _pageLayoutMode = PdfPageLayoutMode.continuous;
                        _scrollDirection = PdfScrollDirection.vertical;
                      } else {
                        _pageLayoutMode = PdfPageLayoutMode.single;
                        _scrollDirection = PdfScrollDirection.horizontal;
                      }
                    });
                  } else if (action.toString().startsWith('ScrollDirection:')) {
                    final scroll = action.toString().split(':')[1];
                    setState(() {
                      if (scroll == 'vertical') {
                        _scrollDirection = PdfScrollDirection.vertical;
                      } else {
                        _scrollDirection = PdfScrollDirection.horizontal;
                      }
                    });
                  }
                },
              ),
            Expanded(
              child: SfPdfViewer.file(
                File(widget.filePath),
                key: _pdfViewerKey,
                controller: _pdfViewerController,
                interactionMode: _interactionMode,
                pageLayoutMode: _pageLayoutMode,
                scrollDirection: _scrollDirection,
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
                  // Handled by top toolbar listener reactively
                },
                onTextSelectionChanged:
                    (PdfTextSelectionChangedDetails details) {
                  if (_overlayEntry != null) {
                    _overlayEntry!.remove();
                    _overlayEntry = null;
                  }
                  if (details.selectedText != null) {
                    _showContextMenu(context, details);
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
