import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

typedef TapCallback = void Function(Object item);

class PdfTopToolbar extends StatefulWidget {
  final PdfViewerController controller;
  final TapCallback? onTap;
  final PdfInteractionMode interactionMode;

  const PdfTopToolbar({
    super.key,
    required this.controller,
    this.onTap,
    this.interactionMode = PdfInteractionMode.selection,
  });

  @override
  State<PdfTopToolbar> createState() => _PdfTopToolbarState();
}

class _PdfTopToolbarState extends State<PdfTopToolbar> {
  late TextEditingController _textEditingController;
  final FocusNode _focusNode = FocusNode();
  int _pageCount = 0;
  double _zoomLevel = 1.0;

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_pageChanged);
    _textEditingController = TextEditingController(
      text: widget.controller.pageNumber.toString(),
    );
    _pageCount = widget.controller.pageCount;
    _zoomLevel = widget.controller.zoomLevel;
  }

  @override
  void dispose() {
    widget.controller.removeListener(_pageChanged);
    _textEditingController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _pageChanged({String? property}) {
    if (mounted) {
      if (_zoomLevel != widget.controller.zoomLevel) {
        setState(() {
          _zoomLevel = widget.controller.zoomLevel;
        });
      }
      if (_pageCount != widget.controller.pageCount) {
        setState(() {
          _pageCount = widget.controller.pageCount;
        });
      }
      if (_textEditingController.text !=
          widget.controller.pageNumber.toString()) {
        _textEditingController.text = widget.controller.pageNumber.toString();
      }
    }
  }

  void _onPageNumberSubmitted(String value) {
    if (value.isNotEmpty) {
      try {
        final int index = int.parse(value);
        if (index > 0 && index <= _pageCount) {
          widget.controller.jumpToPage(index);
          _focusNode.unfocus();
        } else {
          _textEditingController.text = widget.controller.pageNumber.toString();
        }
      } catch (_) {
        _textEditingController.text = widget.controller.pageNumber.toString();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final iconColor = theme.colorScheme.foreground;
    final disabledIconColor = theme.colorScheme.mutedForeground;

    final canJumpToPreviousPage = widget.controller.pageNumber > 1;
    final canJumpToNextPage = widget.controller.pageNumber < _pageCount;

    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: theme.colorScheme.card,
        border: Border(
          bottom: BorderSide(color: theme.colorScheme.border, width: 0.5),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Page navigation section
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Previous page
              ShadButton.ghost(
                width: 36,
                height: 36,
                padding: EdgeInsets.zero,
                onPressed: canJumpToPreviousPage
                    ? () {
                        widget.controller.previousPage();
                      }
                    : null,
                child: Icon(
                  Icons.keyboard_arrow_left,
                  color: canJumpToPreviousPage ? iconColor : disabledIconColor,
                ),
              ),

              // Page input field
              SizedBox(
                width: 48,
                height: 32,
                child: ShadInput(
                  controller: _textEditingController,
                  focusNode: _focusNode,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.small.copyWith(
                    fontWeight: FontWeight.w600,
                    color: iconColor,
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  decoration: ShadDecoration(
                    border: ShadBorder.all(
                      width: 1,
                      color: theme.colorScheme.border,
                      radius: BorderRadius.circular(4),
                    ),
                  ),
                  onSubmitted: _onPageNumberSubmitted,
                ),
              ),

              const SizedBox(width: 6),

              // Total page count
              Text(
                '/ $_pageCount',
                style: theme.textTheme.small.copyWith(
                  color: theme.colorScheme.mutedForeground,
                ),
              ),

              // Next page
              ShadButton.ghost(
                width: 36,
                height: 36,
                padding: EdgeInsets.zero,
                onPressed: canJumpToNextPage
                    ? () {
                        widget.controller.nextPage();
                      }
                    : null,
                child: Icon(
                  Icons.keyboard_arrow_right,
                  color: canJumpToNextPage ? iconColor : disabledIconColor,
                ),
              ),
            ],
          ),

          // Zoom and action tools section
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Zoom percentage dropdown
              SizedBox(
                width: 76,
                height: 32,
                child: ShadSelect<double>(
                  initialValue: _zoomLevel,
                  selectedOptionBuilder: (context, value) => Text(
                    '${(value * 100).floor()}%',
                    style: theme.textTheme.small.copyWith(
                      fontWeight: FontWeight.w500,
                      color: iconColor,
                    ),
                  ),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() {
                        _zoomLevel = value;
                        widget.controller.zoomLevel = value;
                      });
                    }
                  },
                  options: const [
                    ShadOption(value: 1.0, child: Text('100%')),
                    ShadOption(value: 1.25, child: Text('125%')),
                    ShadOption(value: 1.5, child: Text('150%')),
                    ShadOption(value: 2.0, child: Text('200%')),
                    ShadOption(value: 3.0, child: Text('300%')),
                  ],
                ),
              ),
              // Zoom out
              ShadButton.ghost(
                width: 36,
                height: 36,
                padding: EdgeInsets.zero,
                onPressed: _pageCount != 0 && _zoomLevel > 1.0
                    ? () {
                        widget.controller.zoomLevel = (_zoomLevel - 0.25).clamp(
                          1.0,
                          3.0,
                        );
                      }
                    : null,
                child: Icon(
                  Icons.zoom_out,
                  color: _pageCount != 0 && _zoomLevel > 1.0
                      ? iconColor
                      : disabledIconColor,
                ),
              ),
              // Zoom in
              ShadButton.ghost(
                width: 36,
                height: 36,
                padding: EdgeInsets.zero,
                onPressed: _pageCount != 0 && _zoomLevel < 3.0
                    ? () {
                        widget.controller.zoomLevel = (_zoomLevel + 0.25).clamp(
                          1.0,
                          3.0,
                        );
                      }
                    : null,
                child: Icon(
                  Icons.zoom_in,
                  color: _pageCount != 0 && _zoomLevel < 3.0
                      ? iconColor
                      : disabledIconColor,
                ),
              ),

              const SizedBox(width: 4),
              Container(width: 1, height: 24, color: theme.colorScheme.border),
              const SizedBox(width: 4),

              // Pan mode toggle
              ShadButton.ghost(
                width: 36,
                height: 36,
                padding: EdgeInsets.zero,
                backgroundColor:
                    widget.interactionMode == PdfInteractionMode.pan
                    ? theme.colorScheme.accent
                    : null,
                onPressed: () {
                  widget.onTap?.call('Pan mode');
                },
                child: Icon(
                  Icons.pan_tool_rounded,
                  color: widget.interactionMode == PdfInteractionMode.pan
                      ? theme.colorScheme.accentForeground
                      : iconColor,
                ),
              ),

              // Bookmarks toggle
              ShadButton.ghost(
                width: 36,
                height: 36,
                padding: EdgeInsets.zero,
                onPressed: () {
                  widget.onTap?.call('Bookmarks');
                },
                child: Icon(Icons.bookmark_border, color: iconColor),
              ),

              // Search toggle
              ShadButton.ghost(
                width: 36,
                height: 36,
                padding: EdgeInsets.zero,
                onPressed: () {
                  widget.onTap?.call('Search');
                },
                child: Icon(Icons.search, color: iconColor),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
