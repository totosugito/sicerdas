import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';

/// Signature for [SearchToolbar.onTap] callback.
typedef SearchTapCallback = void Function(Object item);

/// SearchToolbar widget
class SearchToolbar extends StatefulWidget {
  ///it describe search toolbar constructor
  const SearchToolbar({
    this.controller,
    this.onTap,
    this.canShowTooltip = true,
    this.brightness,
    this.primaryColor,
    this.textDirection = TextDirection.ltr,
    this.languageCode = 'en',
    super.key,
  });

  /// Indicates whether tooltip for the search toolbar items need to be shown or not.
  final bool canShowTooltip;

  /// An object that is used to control the [SfPdfViewer].
  final PdfViewerController? controller;

  /// Called when the search toolbar item is selected.
  final SearchTapCallback? onTap;

  /// Brightness theme for text search overlay.
  final Brightness? brightness;

  /// Palette color for text search overlay.
  final Color? primaryColor;

  ///A direction of text flow.
  final TextDirection textDirection;

  /// Selected language in property panel
  final String languageCode;

  @override
  SearchToolbarState createState() => SearchToolbarState();
}

/// State for the SearchToolbar widget
class SearchToolbarState extends State<SearchToolbar> {
  Color? _color;
  Color? _textColor;
  late bool _isLight;

  /// Indicates whether search toast need to be shown or not.
  bool canShowToast = false;

  ///An object that is used to retrieve the current value of the TextField.
  final TextEditingController _editingController = TextEditingController();

  /// An object that is used to retrieve the text search result.
  PdfTextSearchResult pdfTextSearchResult = PdfTextSearchResult();

  ///An object that is used to obtain keyboard focus and to handle keyboard events.
  FocusNode? focusNode;

  /// Indicates whether search is initiated or not.
  bool isSearchInitiated = false;

  @override
  void initState() {
    super.initState();
    focusNode = FocusNode();
    focusNode?.requestFocus();
  }

  @override
  void dispose() {
    focusNode?.dispose();
    pdfTextSearchResult.removeListener(() {});
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    _isLight = widget.brightness == Brightness.light;
    _color = _isLight
        ? const Color(0x00000000).withValues(alpha: 0.87)
        : const Color(0x00ffffff).withValues(alpha: 0.87);
    _textColor = _isLight
        ? const Color.fromRGBO(0, 0, 0, 0.54).withValues(alpha: 0.87)
        : const Color(0x00ffffff).withValues(alpha: 0.54);
    super.didChangeDependencies();
  }

  /// Display the Alert Dialog to search from the beginning
  void _showSearchAlertDialog(BuildContext context) {
    showDialog<dynamic>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          insetPadding: EdgeInsets.zero,
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              Text(
                widget.languageCode == 'ar' ? 'نتيجة البحث' : 'Search Result',
                style: TextStyle(
                  color: _color,
                  fontFamily: 'Roboto',
                  fontStyle: FontStyle.normal,
                  fontWeight: FontWeight.w500,
                  fontSize: 20,
                  decoration: TextDecoration.none,
                ),
              ),
              SizedBox(
                height: 36, // height of close search menu button
                width: 36, // width of close search menu button
                child: RawMaterialButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Icon(
                    Icons.clear,
                    color: _isLight
                        ? const Color.fromRGBO(0, 0, 0, 0.54)
                        : const Color.fromRGBO(255, 255, 255, 0.65),
                    size: 20,
                  ),
                ),
              ),
            ],
          ),
          backgroundColor: _isLight
              ? const Color(0xFFFFFFFF)
              : const Color(0xFF424242),
          content: SizedBox(
            width: 328,
            child: Text(
              widget.languageCode == 'ar'
                  ? 'لم يتم العثور على تكرارات أخرى. هل ترغب في متابعة البحث من البداية؟'
                  : 'No more occurrences found. Would you like to continue to search from the beginning?',
              style: TextStyle(
                color: _color,
                fontFamily: 'Roboto',
                fontStyle: FontStyle.normal,
                fontWeight: FontWeight.normal,
                fontSize: 15,
                decoration: TextDecoration.none,
              ),
            ),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                pdfTextSearchResult.clear();
                _editingController.clear();
                isSearchInitiated = false;
                focusNode?.requestFocus();
                Navigator.of(context).pop();
              },
              style: TextButton.styleFrom(foregroundColor: Colors.transparent),
              child: Text(
                widget.languageCode == 'ar' ? 'لا' : 'NO',
                style: TextStyle(
                  color: widget.primaryColor,
                  fontFamily: 'Roboto',
                  fontStyle: FontStyle.normal,
                  fontWeight: FontWeight.normal,
                  fontSize: 14,
                  decoration: TextDecoration.none,
                ),
              ),
            ),
            TextButton(
              onPressed: () {
                pdfTextSearchResult.nextInstance();
                Navigator.of(context).pop();
              },
              style: TextButton.styleFrom(foregroundColor: Colors.transparent),
              child: Text(
                widget.languageCode == 'ar' ? 'نعم' : 'YES',
                style: TextStyle(
                  color: widget.primaryColor,
                  fontFamily: 'Roboto',
                  fontStyle: FontStyle.normal,
                  fontWeight: FontWeight.normal,
                  fontSize: 14,
                  decoration: TextDecoration.none,
                ),
              ),
            ),
          ],
          actionsPadding: const EdgeInsets.only(bottom: 10),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 56, // height of search toolbar
      child: Row(
        children: <Widget>[
          Material(
            color: Colors.transparent,
            child: IconButton(
              // Back button to navigate to the main toolbar.
              icon: Icon(
                Icons.arrow_back,
                color: _isLight
                    ? const Color(0x00000000).withValues(alpha: 0.54)
                    : const Color(0x00ffffff).withValues(alpha: 0.54),
                size: 24,
              ),
              onPressed: () {
                widget.onTap?.call('Cancel Search');
                isSearchInitiated = false;
                _editingController.clear();
                pdfTextSearchResult.clear();
              },
            ),
          ),
          // Search input text field
          Flexible(
            child: TextFormField(
              style: TextStyle(
                color: _color,
                fontWeight: FontWeight.normal,
                fontFamily: 'Roboto',
                fontStyle: FontStyle.normal,
                fontSize: 16,
              ),
              enableInteractiveSelection: false,
              focusNode: focusNode,
              keyboardType: TextInputType.text,
              textInputAction: TextInputAction.search,
              controller: _editingController,
              decoration: InputDecoration(
                border: InputBorder.none,
                hintText: widget.languageCode == 'ar' ? 'يجد' : 'Find...',
                hintStyle: TextStyle(
                  color: _isLight
                      ? const Color(0x00000000).withValues(alpha: 0.34)
                      : const Color(0x00ffffff).withValues(alpha: 0.54),
                  fontWeight: FontWeight.normal,
                  fontFamily: 'Roboto',
                  fontStyle: FontStyle.normal,
                  fontSize: 16,
                ),
              ),
              onChanged: (String text) {
                if (_editingController.text.isNotEmpty) {
                  setState(() {});
                }
              },
              onFieldSubmitted: (String value) {
                isSearchInitiated = true;
                pdfTextSearchResult = widget.controller!.searchText(
                  _editingController.text,
                );
                pdfTextSearchResult.addListener(() {
                  if (super.mounted) {
                    setState(() {});
                  }
                  if (!pdfTextSearchResult.hasResult &&
                      pdfTextSearchResult.isSearchCompleted) {
                    widget.onTap?.call('noResultFound');
                  }
                  if (pdfTextSearchResult.hasResult &&
                      pdfTextSearchResult.isSearchCompleted) {
                    widget.onTap?.call('Search Completed');
                  }
                });
              },
            ),
          ),
          // Cancel search.
          Visibility(
            visible: _editingController.text.isNotEmpty,
            child: Material(
              color: Colors.transparent,
              child: IconButton(
                icon: Icon(
                  Icons.clear,
                  size: 24,
                  color: _isLight
                      ? const Color.fromRGBO(0, 0, 0, 0.54)
                      : const Color.fromRGBO(255, 255, 255, 0.65),
                ),
                onPressed: () {
                  setState(() {
                    _editingController.clear();
                    pdfTextSearchResult.clear();
                    widget.controller!.clearSelection();
                    isSearchInitiated = false;
                    focusNode?.requestFocus();
                  });
                  widget.onTap?.call('Clear Text');
                },
                tooltip: widget.canShowTooltip
                    ? widget.languageCode == 'ar'
                          ? 'نص واضح'
                          : 'Clear Text'
                    : null,
              ),
            ),
          ),
          // Search result
          Visibility(
            visible: pdfTextSearchResult.hasResult,
            child: Row(
              children: <Widget>[
                // Current instance
                Text(
                  '${pdfTextSearchResult.currentInstanceIndex}',
                  style: TextStyle(
                    color: _textColor,
                    fontWeight: FontWeight.normal,
                    fontFamily: 'Roboto',
                    fontStyle: FontStyle.normal,
                    fontSize: 12,
                  ),
                ),
                // `Of` label
                Text(
                  ' of ',
                  style: TextStyle(
                    color: _textColor,
                    fontWeight: FontWeight.normal,
                    fontFamily: 'Roboto',
                    fontStyle: FontStyle.normal,
                    fontSize: 12,
                  ),
                ),
                // Total search instance count
                Text(
                  '${pdfTextSearchResult.totalInstanceCount}',
                  style: TextStyle(
                    color: _textColor,
                    fontWeight: FontWeight.normal,
                    fontFamily: 'Roboto',
                    fontStyle: FontStyle.normal,
                    fontSize: 12,
                  ),
                ),
                // Navigate to previous search instance.
                Material(
                  color: Colors.transparent,
                  child: IconButton(
                    icon: Icon(
                      Icons.navigate_before,
                      color: _isLight
                          ? const Color.fromRGBO(0, 0, 0, 0.54)
                          : const Color.fromRGBO(255, 255, 255, 0.65),
                      size: 24,
                    ),
                    onPressed: () {
                      setState(() {
                        pdfTextSearchResult.previousInstance();
                      });
                      widget.onTap?.call('Previous Instance');
                    },
                    tooltip: widget.canShowTooltip
                        ? widget.languageCode == 'ar'
                              ? 'سابق'
                              : 'Previous'
                        : null,
                  ),
                ),
                // Navigate to next search instance.
                Material(
                  color: Colors.transparent,
                  child: IconButton(
                    icon: Icon(
                      Icons.navigate_next,
                      size: 24,
                      color: _isLight
                          ? const Color.fromRGBO(0, 0, 0, 0.54)
                          : const Color.fromRGBO(255, 255, 255, 0.65),
                    ),
                    onPressed: () {
                      setState(() {
                        if (pdfTextSearchResult.currentInstanceIndex ==
                                pdfTextSearchResult.totalInstanceCount &&
                            pdfTextSearchResult.currentInstanceIndex != 0 &&
                            pdfTextSearchResult.totalInstanceCount != 0 &&
                            pdfTextSearchResult.isSearchCompleted) {
                          _showSearchAlertDialog(context);
                        } else {
                          widget.controller!.clearSelection();
                          pdfTextSearchResult.nextInstance();
                        }
                      });
                      widget.onTap?.call('Next Instance');
                    },
                    tooltip: widget.canShowTooltip
                        ? widget.languageCode == 'ar'
                              ? 'التالي'
                              : 'Next'
                        : null,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Toolbar item widget
class ToolbarItem extends StatelessWidget {
  ///Creates a toolbar item
  const ToolbarItem({super.key, this.height, this.width, required this.child});

  /// Height of the toolbar item
  final double? height;

  /// Width of the toolbar item
  final double? width;

  /// Child widget of the toolbar item
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    return SizedBox(height: height, width: width, child: child);
  }
}

/// Split button widget.
class SplitButton extends StatelessWidget {
  /// Create Split button widget.
  const SplitButton({
    required this.onPrimaryButtonPressed,
    required this.onSecondaryButtonPressed,
    required this.child,
    this.height,
    this.width,
    super.key,
  });

  /// Triggers when the primary button is pressed.
  final VoidCallback? onPrimaryButtonPressed;

  /// Triggers when the drop down icon is pressed.
  final VoidCallback? onSecondaryButtonPressed;

  /// Height of the split button.
  final double? height;

  /// Width of the split button.
  final double? width;

  /// The child widget.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      width: width,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          GestureDetector(onTap: onPrimaryButtonPressed, child: child),
          SizedBox(
            height: height,
            child: GestureDetector(
              onTap: onSecondaryButtonPressed,
              child: const Icon(Icons.keyboard_arrow_down, size: 16),
            ),
          ),
        ],
      ),
    );
  }
}
