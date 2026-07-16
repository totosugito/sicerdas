import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';
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
  bool _caseSensitive = false;
  bool _wholeWords = false;
  String? _password;
  final TextEditingController _passwordController = TextEditingController();
  final GlobalKey<FormState> _passwordFormKey = GlobalKey<FormState>();
  bool _passwordVisible = true;
  String _passwordErrorText = '';
  bool _hasPasswordDialog = false;

  void _showPasswordDialog() {
    _hasPasswordDialog = true;
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        final theme = ShadTheme.of(context);
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              backgroundColor: theme.colorScheme.card,
              title: Text(
                'Password Required',
                style: theme.textTheme.large.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.foreground,
                ),
              ),
              content: SizedBox(
                width: 320,
                child: Form(
                  key: _passwordFormKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'This document is password protected. Please enter the password to open it.',
                        style: theme.textTheme.p.copyWith(
                          color: theme.colorScheme.mutedForeground,
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _passwordVisible,
                        autofocus: true,
                        style: TextStyle(color: theme.colorScheme.foreground),
                        decoration: InputDecoration(
                          hintText: 'Enter password',
                          hintStyle: TextStyle(
                            color: theme.colorScheme.mutedForeground,
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _passwordVisible
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                              color: theme.colorScheme.mutedForeground,
                            ),
                            onPressed: () {
                              setStateDialog(() {
                                _passwordVisible = !_passwordVisible;
                              });
                            },
                          ),
                        ),
                        validator: (value) {
                          if (_passwordErrorText.isNotEmpty) {
                            return _passwordErrorText;
                          }
                          if (value == null || value.isEmpty) {
                            return 'Password cannot be empty';
                          }
                          return null;
                        },
                        onChanged: (value) {
                          if (_passwordErrorText.isNotEmpty) {
                            setState(() {
                              _passwordErrorText = '';
                            });
                            _passwordFormKey.currentState?.validate();
                          }
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    _hasPasswordDialog = false;
                    _passwordController.clear();
                    Navigator.of(context).pop();
                    if (!widget.exitOnClose) {
                      Navigator.of(context).pop();
                    } else {
                      SystemNavigator.pop();
                    }
                  },
                  child: Text(
                    'Cancel',
                    style: TextStyle(color: theme.colorScheme.mutedForeground),
                  ),
                ),
                TextButton(
                  onPressed: () {
                    if (_passwordFormKey.currentState?.validate() ?? false) {
                      setState(() {
                        _password = _passwordController.text;
                        _hasPasswordDialog = false;
                      });
                      Navigator.of(context).pop();
                    }
                  },
                  child: Text(
                    'Open',
                    style: TextStyle(color: theme.colorScheme.primary),
                  ),
                ),
              ],
            );
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
    try {
      final List<int> savedBytes = await _pdfViewerController.saveDocument();
      final file = File(widget.filePath);
      await file.writeAsBytes(savedBytes);
      if (mounted) {
        ToastUtils.showSuccess(
          context,
          title: 'Success',
          message: 'Document saved successfully',
        );
      }
    } catch (e) {
      if (mounted) {
        ToastUtils.showError(
          context,
          title: 'Error',
          message: 'Failed to save document: $e',
        );
      }
    }
  }

  Future<void> _saveAsPdfDocument() async {
    final originalFile = File(widget.filePath);
    final originalName = originalFile.uri.pathSegments.last;
    final TextEditingController nameController = TextEditingController(
      text: originalName,
    );
    final GlobalKey<FormState> formKey = GlobalKey<FormState>();

    showDialog<void>(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        final theme = ShadTheme.of(context);
        return AlertDialog(
          backgroundColor: theme.colorScheme.card,
          title: Text(
            'Save As',
            style: theme.textTheme.large.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.foreground,
            ),
          ),
          content: SizedBox(
            width: 320,
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Enter a new name for the document:',
                    style: theme.textTheme.p.copyWith(
                      color: theme.colorScheme.mutedForeground,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: nameController,
                    autofocus: true,
                    style: TextStyle(color: theme.colorScheme.foreground),
                    decoration: InputDecoration(
                      hintText: 'filename.pdf',
                      hintStyle: TextStyle(
                        color: theme.colorScheme.mutedForeground,
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Filename cannot be empty';
                      }
                      return null;
                    },
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text(
                'Cancel',
                style: TextStyle(color: theme.colorScheme.mutedForeground),
              ),
            ),
            TextButton(
              onPressed: () async {
                if (formKey.currentState?.validate() ?? false) {
                  var newName = nameController.text.trim();
                  if (!newName.toLowerCase().endsWith('.pdf')) {
                    newName += '.pdf';
                  }
                  final String dir = originalFile.parent.path;
                  final String newPath = '$dir/$newName';

                  Navigator.of(context).pop();

                  try {
                    final List<int> savedBytes = await _pdfViewerController
                        .saveDocument();
                    final newFile = File(newPath);
                    await newFile.writeAsBytes(savedBytes);
                    if (mounted) {
                      ToastUtils.showSuccess(
                        this.context,
                        title: 'Success',
                        message: 'Document saved as: $newName',
                      );
                    }
                  } catch (e) {
                    if (mounted) {
                      ToastUtils.showError(
                        this.context,
                        title: 'Error',
                        message: 'Failed to save document: $e',
                      );
                    }
                  }
                }
              },
              child: Text(
                'Save',
                style: TextStyle(color: theme.colorScheme.primary),
              ),
            ),
          ],
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
    _passwordController.dispose();
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
                    _performSearch(value);
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
                icon: Text(
                  'Aa',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: _caseSensitive
                        ? theme.colorScheme.primary
                        : theme.colorScheme.mutedForeground,
                  ),
                ),
                tooltip: 'Match Case',
                onPressed: () {
                  setState(() {
                    _caseSensitive = !_caseSensitive;
                    if (_searchController.text.isNotEmpty) {
                      _performSearch(_searchController.text);
                    }
                  });
                },
              ),
              IconButton(
                icon: Text(
                  'W',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: _wholeWords
                        ? theme.colorScheme.primary
                        : theme.colorScheme.mutedForeground,
                  ),
                ),
                tooltip: 'Whole Words',
                onPressed: () {
                  setState(() {
                    _wholeWords = !_wholeWords;
                    if (_searchController.text.isNotEmpty) {
                      _performSearch(_searchController.text);
                    }
                  });
                },
              ),
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
                  } else if (action == 'Save') {
                    _savePdfDocument();
                  } else if (action == 'Save As') {
                    _saveAsPdfDocument();
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
                canShowPasswordDialog: false,
                password: _password,
                onDocumentLoadFailed: (PdfDocumentLoadFailedDetails details) {
                  if (details.description.contains('password')) {
                    if (_hasPasswordDialog) {
                      setState(() {
                        _passwordErrorText = 'Invalid password';
                        _passwordFormKey.currentState?.validate();
                        _passwordController.clear();
                      });
                    } else {
                      _passwordErrorText = '';
                      _showPasswordDialog();
                    }
                  } else {
                    ToastUtils.showError(
                      context,
                      title: 'Error loading PDF',
                      message: details.description,
                    );
                  }
                },
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
