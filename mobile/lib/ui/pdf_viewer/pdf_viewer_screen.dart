import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:share_plus/share_plus.dart';
import 'package:bse/core/utils/toast_utils.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:syncfusion_flutter_core/theme.dart';
import 'widgets/pdf_context_menu.dart';
import 'widgets/pdf_top_toolbar.dart';
import 'widgets/pdf_search_bar_field.dart';
import 'widgets/pdf_password_dialog.dart';
import 'widgets/pdf_save_as_dialog.dart';

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
  bool _caseSensitive = false;
  bool _wholeWords = false;
  String? _password;
  String _passwordErrorText = '';

  void _showPasswordDialog() {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return PdfPasswordDialog(
          errorText: _passwordErrorText,
          onSubmit: (password) {
            setState(() {
              _password = password;
            });
            Navigator.of(context).pop();
          },
          onCancel: () {
            Navigator.of(context).pop();
            if (!widget.exitOnClose) {
              Navigator.of(context).pop();
            } else {
              SystemNavigator.pop();
            }
          },
        );
      },
    );
  }

  void _performSearch(String value) {
    if (value.isNotEmpty) {
      TextSearchOption? searchOption;
      if (_caseSensitive && _wholeWords) {
        searchOption = TextSearchOption.both;
      } else if (_caseSensitive) {
        searchOption = TextSearchOption.caseSensitive;
      } else if (_wholeWords) {
        searchOption = TextSearchOption.wholeWords;
      }

      _searchResult = _pdfViewerController.searchText(
        value,
        searchOption: searchOption,
      );
      if (_searchResult.totalInstanceCount == 0) {
        final l10n = Translations.of(context);
        ToastUtils.showInfo(
          context,
          title: l10n.common.infoTitle,
          message: l10n.common.textNotFound,
        );
      }
      setState(() {});
    }
  }

  Future<void> _savePdfDocument() async {
    final t = Translations.of(context);
    try {
      final List<int> savedBytes = await _pdfViewerController.saveDocument();
      final file = File(widget.filePath);
      await file.writeAsBytes(savedBytes);
      if (mounted) {
        ToastUtils.showSuccess(
          context,
          title: t.common.successTitle,
          message: t.pdf_viewer.screen.successSave,
        );
      }
    } catch (e) {
      if (mounted) {
        ToastUtils.showError(
          context,
          title: t.common.error.title,
          message: t.pdf_viewer.saveAsDialog.errorSave(error: e.toString()),
        );
      }
    }
  }

  Future<void> _saveAsPdfDocument() async {
    final originalFile = File(widget.filePath);
    final originalName = originalFile.uri.pathSegments.last;

    showDialog<void>(
      context: context,
      barrierDismissible: true,
      builder: (dialogContext) {
        return PdfSaveAsDialog(
          initialName: originalName,
          onBrowseAndSave: (newName) async {
            final t = Translations.of(context);
            try {
              final List<int> savedBytes = await _pdfViewerController
                  .saveDocument();
              final tempDir = Directory.systemTemp;
              final tempFile = File('${tempDir.path}/$newName');
              await tempFile.writeAsBytes(savedBytes);

              await SharePlus.instance.share(
                ShareParams(
                  text: t.pdf_viewer.saveAsDialog.shareTextPrefix(
                    name: newName,
                  ),
                  files: [XFile(tempFile.path)],
                ),
              );
            } catch (e) {
              if (mounted) {
                ToastUtils.showError(
                  context,
                  title: t.pdf_viewer.saveAsDialog.title,
                  message: t.pdf_viewer.saveAsDialog.errorExport(
                    error: e.toString(),
                  ),
                );
              }
            }
          },
          onSaveLocal: (newName) async {
            final t = Translations.of(context);
            final String dir = originalFile.parent.path;
            final String newPath = '$dir/$newName';

            try {
              final List<int> savedBytes = await _pdfViewerController
                  .saveDocument();
              final newFile = File(newPath);
              await newFile.writeAsBytes(savedBytes);
              if (mounted) {
                ToastUtils.showSuccess(
                  context,
                  title: t.pdf_viewer.saveAsDialog.title,
                  message: t.pdf_viewer.saveAsDialog.successLocal(
                    name: newName,
                  ),
                );
              }
            } catch (e) {
              if (mounted) {
                ToastUtils.showError(
                  context,
                  title: t.pdf_viewer.saveAsDialog.title,
                  message: t.pdf_viewer.saveAsDialog.errorSave(
                    error: e.toString(),
                  ),
                );
              }
            }
          },
        );
      },
    );
  }

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
          automaticallyImplyLeading: !_isSearching,
          titleSpacing: _isSearching ? 4 : null,
          title: _isSearching
              ? Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back),
                      onPressed: () {
                        setState(() {
                          _isSearching = false;
                          _searchController.clear();
                          _searchResult.clear();
                        });
                      },
                    ),
                    Expanded(
                      child: PdfSearchBarField(
                        controller: _searchController,
                        placeholder: l10n.common.searchText,
                        caseSensitive: _caseSensitive,
                        wholeWords: _wholeWords,
                        onCaseSensitiveChanged: (value) {
                          setState(() {
                            _caseSensitive = value;
                            if (_searchController.text.isNotEmpty) {
                              _performSearch(_searchController.text);
                            }
                          });
                        },
                        onWholeWordsChanged: (value) {
                          setState(() {
                            _wholeWords = value;
                            if (_searchController.text.isNotEmpty) {
                              _performSearch(_searchController.text);
                            }
                          });
                        },
                        onSubmitted: (value) {
                          _performSearch(value);
                        },
                      ),
                    ),
                  ],
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
                  switch (action) {
                    case PdfToolbarAction.search:
                      setState(() {
                        _isSearching = true;
                      });
                      break;
                    case PdfToolbarAction.bookmarks:
                      _pdfViewerKey.currentState?.openBookmarkView();
                      break;
                    case PdfToolbarAction.panMode:
                      setState(() {
                        _interactionMode =
                            _interactionMode == PdfInteractionMode.selection
                                ? PdfInteractionMode.pan
                                : PdfInteractionMode.selection;
                      });
                      break;
                    case PdfToolbarAction.annotations:
                      setState(() {
                        _isAnnotationMode = !_isAnnotationMode;
                        if (_isAnnotationMode) {
                          _isSettingsMode = false;
                        }
                        _pdfViewerController.annotationMode = _isAnnotationMode
                            ? PdfAnnotationMode.highlight
                            : PdfAnnotationMode.none;
                      });
                      break;
                    case PdfToolbarAction.viewSettings:
                      setState(() {
                        _isSettingsMode = !_isSettingsMode;
                        if (_isSettingsMode) {
                          _isAnnotationMode = false;
                          _pdfViewerController.annotationMode =
                              PdfAnnotationMode.none;
                        }
                      });
                      break;
                    case PdfToolbarAction.pageLayoutContinuous:
                      setState(() {
                        _pageLayoutMode = PdfPageLayoutMode.continuous;
                        _scrollDirection = PdfScrollDirection.vertical;
                      });
                      break;
                    case PdfToolbarAction.pageLayoutSingle:
                      setState(() {
                        _pageLayoutMode = PdfPageLayoutMode.single;
                        _scrollDirection = PdfScrollDirection.horizontal;
                      });
                      break;
                    case PdfToolbarAction.scrollVertical:
                      setState(() {
                        _scrollDirection = PdfScrollDirection.vertical;
                      });
                      break;
                    case PdfToolbarAction.scrollHorizontal:
                      setState(() {
                        _scrollDirection = PdfScrollDirection.horizontal;
                      });
                      break;
                    case PdfToolbarAction.save:
                      _savePdfDocument();
                      break;
                    case PdfToolbarAction.saveAs:
                      _saveAsPdfDocument();
                      break;
                    default:
                      break;
                  }
                },
              ),
            Expanded(
              child: SfPdfViewerTheme(
                data: SfPdfViewerThemeData(
                  backgroundColor: theme.colorScheme.background,
                ),
                child: SfPdfViewer.file(
                  File(widget.filePath),
                  key: _pdfViewerKey,
                  controller: _pdfViewerController,
                  interactionMode: _interactionMode,
                  pageLayoutMode: _pageLayoutMode,
                  scrollDirection: _scrollDirection,
                  canShowPasswordDialog: false,
                  password: _password,
                  onDocumentLoadFailed: (PdfDocumentLoadFailedDetails details) {
                    if (details.description.contains('password')) {
                      setState(() {
                        _passwordErrorText = _password != null
                            ? l10n.pdf_viewer.passwordDialog.errorInvalid
                            : '';
                      });
                      _showPasswordDialog();
                    } else {
                      ToastUtils.showError(
                        context,
                        title: l10n.pdf_viewer.screen.errorLoading,
                        message: details.description,
                      );
                    }
                  },
                  canShowTextSelectionMenu: false,
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
            ),
          ],
        ),
      ),
    );
  }
}
