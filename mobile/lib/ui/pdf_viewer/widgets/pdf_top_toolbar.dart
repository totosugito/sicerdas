import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';

enum PdfToolbarAction {
  search,
  bookmarks,
  panMode,
  annotations,
  viewSettings,
  save,
  saveAs,
  pageLayoutContinuous,
  pageLayoutSingle,
  scrollVertical,
  scrollHorizontal,
  annotationHighlight,
  annotationUnderline,
  annotationStrikethrough,
  annotationSquiggly,
}

typedef TapCallback = void Function(PdfToolbarAction action);

class PdfTopToolbar extends StatefulWidget {
  final PdfViewerController controller;
  final TapCallback? onTap;
  final PdfInteractionMode interactionMode;
  final bool isAnnotationMode;
  final bool isSettingsMode;
  final PdfPageLayoutMode pageLayoutMode;
  final PdfScrollDirection scrollDirection;

  const PdfTopToolbar({
    super.key,
    required this.controller,
    this.onTap,
    this.interactionMode = PdfInteractionMode.selection,
    this.isAnnotationMode = false,
    this.isSettingsMode = false,
    this.pageLayoutMode = PdfPageLayoutMode.continuous,
    this.scrollDirection = PdfScrollDirection.vertical,
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

  final ShadPopoverController _popoverController = ShadPopoverController();

  @override
  void dispose() {
    widget.controller.removeListener(_pageChanged);
    _textEditingController.dispose();
    _focusNode.dispose();
    _popoverController.dispose();
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

  Widget _buildMoreActionsPopover(
    BuildContext context,
    ShadThemeData theme,
    Color iconColor,
  ) {
    final t = Translations.of(context).pdf_viewer.toolbar;
    return ShadPopover(
      controller: _popoverController,
      popover: (context) => Container(
        width: 200,
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildPopoverMenuItem(
              icon: Icons.search,
              label: t.search,
              onPressed: () {
                _popoverController.hide();
                widget.onTap?.call(PdfToolbarAction.search);
              },
              theme: theme,
            ),
            _buildPopoverMenuItem(
              icon: Icons.bookmark_border,
              label: t.bookmarks,
              onPressed: () {
                _popoverController.hide();
                widget.onTap?.call(PdfToolbarAction.bookmarks);
              },
              theme: theme,
            ),
            _buildPopoverMenuItem(
              icon: Icons.pan_tool_rounded,
              label: t.panMode,
              active: widget.interactionMode == PdfInteractionMode.pan,
              onPressed: () {
                _popoverController.hide();
                widget.onTap?.call(PdfToolbarAction.panMode);
              },
              theme: theme,
            ),
            _buildPopoverMenuItem(
              icon: Icons.draw,
              label: t.annotations,
              active: widget.isAnnotationMode,
              onPressed: () {
                _popoverController.hide();
                widget.onTap?.call(PdfToolbarAction.annotations);
              },
              theme: theme,
            ),
            _buildPopoverMenuItem(
              icon: Icons.settings,
              label: t.viewSettings,
              active: widget.isSettingsMode,
              onPressed: () {
                _popoverController.hide();
                widget.onTap?.call(PdfToolbarAction.viewSettings);
              },
              theme: theme,
            ),
            const Divider(height: 8),
            _buildPopoverMenuItem(
              icon: Icons.save,
              label: t.save,
              disabled: _pageCount == 0,
              onPressed: () {
                _popoverController.hide();
                widget.onTap?.call(PdfToolbarAction.save);
              },
              theme: theme,
            ),
            _buildPopoverMenuItem(
              icon: Icons.save_as,
              label: t.saveAs,
              disabled: _pageCount == 0,
              onPressed: () {
                _popoverController.hide();
                widget.onTap?.call(PdfToolbarAction.saveAs);
              },
              theme: theme,
            ),
          ],
        ),
      ),
      child: ShadButton.ghost(
        width: 36,
        height: 36,
        padding: EdgeInsets.zero,
        onPressed: () {
          _popoverController.toggle();
        },
        child: Icon(Icons.more_vert, color: iconColor),
      ),
    );
  }

  Widget _buildPopoverMenuItem({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
    required ShadThemeData theme,
    bool active = false,
    bool disabled = false,
  }) {
    final fgColor = disabled
        ? theme.colorScheme.mutedForeground
        : (active ? theme.colorScheme.primary : theme.colorScheme.foreground);

    return InkWell(
      onTap: disabled ? null : onPressed,
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        color: active ? theme.colorScheme.accent : null,
        child: Row(
          children: [
            Icon(icon, size: 18, color: fgColor),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                textAlign: TextAlign.start,
                style: theme.textTheme.small.copyWith(
                  color: fgColor,
                  fontWeight: active ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final iconColor = theme.colorScheme.foreground;
    final disabledIconColor = theme.colorScheme.mutedForeground;

    final canJumpToPreviousPage = widget.controller.pageNumber > 1;
    final canJumpToNextPage = widget.controller.pageNumber < _pageCount;

    return Container(
      height: (widget.isAnnotationMode || widget.isSettingsMode) ? 96 : 48,
      decoration: BoxDecoration(
        color: theme.colorScheme.card,
        border: Border(
          bottom: BorderSide(color: theme.colorScheme.border, width: 0.5),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            height: 47.5,
            child: Padding(
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
                        width: 32,
                        height: 32,
                        padding: EdgeInsets.zero,
                        onPressed: canJumpToPreviousPage
                            ? () {
                                widget.controller.previousPage();
                              }
                            : null,
                        child: Icon(
                          Icons.keyboard_arrow_left,
                          color: canJumpToPreviousPage
                              ? iconColor
                              : disabledIconColor,
                        ),
                      ),

                      // Page input field
                      SizedBox(
                        width: (_pageCount.toString().length * 8.0 + 32.0)
                            .clamp(44.0, 72.0),
                        height: 32,
                        child: ShadInput(
                          controller: _textEditingController,
                          focusNode: _focusNode,
                          keyboardType: TextInputType.number,
                          textAlign: TextAlign.center,
                          alignment: Alignment.center,
                          style: theme.textTheme.small.copyWith(
                            fontWeight: FontWeight.w600,
                            color: iconColor,
                            height: 1.0,
                          ),
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
                        width: 32,
                        height: 32,
                        padding: EdgeInsets.zero,
                        onPressed: canJumpToNextPage
                            ? () {
                                widget.controller.nextPage();
                              }
                            : null,
                        child: Icon(
                          Icons.keyboard_arrow_right,
                          color: canJumpToNextPage
                              ? iconColor
                              : disabledIconColor,
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
                        width: 68,
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
                        width: 32,
                        height: 32,
                        padding: EdgeInsets.zero,
                        onPressed: _pageCount != 0 && _zoomLevel > 1.0
                            ? () {
                                widget.controller.zoomLevel =
                                    (_zoomLevel - 0.25).clamp(1.0, 3.0);
                              }
                            : null,
                        child: Icon(
                          Icons.zoom_out,
                          size: 18,
                          color: _pageCount != 0 && _zoomLevel > 1.0
                              ? iconColor
                              : disabledIconColor,
                        ),
                      ),
                      // Zoom in
                      ShadButton.ghost(
                        width: 32,
                        height: 32,
                        padding: EdgeInsets.zero,
                        onPressed: _pageCount != 0 && _zoomLevel < 3.0
                            ? () {
                                widget.controller.zoomLevel =
                                    (_zoomLevel + 0.25).clamp(1.0, 3.0);
                              }
                            : null,
                        child: Icon(
                          Icons.zoom_in,
                          size: 18,
                          color: _pageCount != 0 && _zoomLevel < 3.0
                              ? iconColor
                              : disabledIconColor,
                        ),
                      ),

                      const SizedBox(width: 4),
                      Container(
                        width: 1,
                        height: 20,
                        color: theme.colorScheme.border,
                      ),
                      const SizedBox(width: 4),

                      // More Actions Popover
                      _buildMoreActionsPopover(context, theme, iconColor),
                    ],
                  ),
                ],
              ),
            ),
          ),
          if (widget.isAnnotationMode) ...[
            Container(height: 0.5, color: theme.colorScheme.border),
            Container(
              height: 47.5,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Text(
                    Translations.of(context).pdf_viewer.toolbar.annotation,
                    style: theme.textTheme.small.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.mutedForeground,
                    ),
                  ),
                  const SizedBox(width: 12),
                  _buildAnnotationModeButton(
                    mode: PdfAnnotationMode.highlight,
                    icon: Icons.border_color,
                    tooltip: Translations.of(
                      context,
                    ).pdf_viewer.toolbar.highlight,
                    theme: theme,
                  ),
                  const SizedBox(width: 8),
                  _buildAnnotationModeButton(
                    mode: PdfAnnotationMode.underline,
                    icon: Icons.format_underlined,
                    tooltip: Translations.of(
                      context,
                    ).pdf_viewer.toolbar.underline,
                    theme: theme,
                  ),
                  const SizedBox(width: 8),
                  _buildAnnotationModeButton(
                    mode: PdfAnnotationMode.strikethrough,
                    icon: Icons.format_strikethrough,
                    tooltip: Translations.of(
                      context,
                    ).pdf_viewer.toolbar.strikethrough,
                    theme: theme,
                  ),
                  const SizedBox(width: 8),
                  _buildAnnotationModeButton(
                    mode: PdfAnnotationMode.squiggly,
                    icon: Icons.gesture,
                    tooltip: Translations.of(
                      context,
                    ).pdf_viewer.toolbar.squiggly,
                    theme: theme,
                  ),
                  const Spacer(),
                  ShadButton.ghost(
                    width: 32,
                    height: 32,
                    padding: EdgeInsets.zero,
                    onPressed: () {
                      widget.onTap?.call(PdfToolbarAction.annotations);
                    },
                    child: Icon(Icons.close, size: 18, color: iconColor),
                  ),
                ],
              ),
            ),
          ],
          if (widget.isSettingsMode) ...[
            Container(height: 0.5, color: theme.colorScheme.border),
            Container(
              height: 47.5,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Text(
                    Translations.of(context).pdf_viewer.toolbar.pageLayout,
                    style: theme.textTheme.small.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.mutedForeground,
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildSettingsButton(
                    active:
                        widget.pageLayoutMode == PdfPageLayoutMode.continuous,
                    icon: Icons.splitscreen,
                    tooltip: Translations.of(
                      context,
                    ).pdf_viewer.toolbar.continuousPage,
                    onPressed: () {
                      widget.onTap?.call(PdfToolbarAction.pageLayoutContinuous);
                    },
                    theme: theme,
                  ),
                  const SizedBox(width: 6),
                  _buildSettingsButton(
                    active: widget.pageLayoutMode == PdfPageLayoutMode.single,
                    icon: Icons.file_copy,
                    tooltip: Translations.of(
                      context,
                    ).pdf_viewer.toolbar.pageByPage,
                    onPressed: () {
                      widget.onTap?.call(PdfToolbarAction.pageLayoutSingle);
                    },
                    theme: theme,
                  ),
                  const SizedBox(width: 16),
                  Container(
                    width: 1,
                    height: 24,
                    color: theme.colorScheme.border,
                  ),
                  const SizedBox(width: 16),
                  Text(
                    Translations.of(context).pdf_viewer.toolbar.scroll,
                    style: theme.textTheme.small.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.mutedForeground,
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildSettingsButton(
                    active:
                        widget.scrollDirection == PdfScrollDirection.vertical,
                    icon: Icons.swap_vert,
                    tooltip: Translations.of(
                      context,
                    ).pdf_viewer.toolbar.verticalScrolling,
                    onPressed: () {
                      widget.onTap?.call(PdfToolbarAction.scrollVertical);
                    },
                    theme: theme,
                  ),
                  const SizedBox(width: 6),
                  _buildSettingsButton(
                    active:
                        widget.scrollDirection == PdfScrollDirection.horizontal,
                    icon: Icons.swap_horiz,
                    tooltip: Translations.of(
                      context,
                    ).pdf_viewer.toolbar.horizontalScrolling,
                    onPressed: () {
                      widget.onTap?.call(PdfToolbarAction.scrollHorizontal);
                    },
                    theme: theme,
                  ),
                  const Spacer(),
                  ShadButton.ghost(
                    width: 32,
                    height: 32,
                    padding: EdgeInsets.zero,
                    onPressed: () {
                      widget.onTap?.call(PdfToolbarAction.viewSettings);
                    },
                    child: Icon(Icons.close, size: 18, color: iconColor),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAnnotationModeButton({
    required PdfAnnotationMode mode,
    required IconData icon,
    required String tooltip,
    required ShadThemeData theme,
  }) {
    final isSelected = widget.controller.annotationMode == mode;
    final iconColor = theme.colorScheme.foreground;

    return ShadButton.ghost(
      width: 36,
      height: 36,
      padding: EdgeInsets.zero,
      backgroundColor: isSelected ? theme.colorScheme.accent : null,
      onPressed: () {
        setState(() {
          widget.controller.annotationMode = mode;
        });
        final action = switch (mode) {
          PdfAnnotationMode.highlight => PdfToolbarAction.annotationHighlight,
          PdfAnnotationMode.underline => PdfToolbarAction.annotationUnderline,
          PdfAnnotationMode.strikethrough =>
            PdfToolbarAction.annotationStrikethrough,
          PdfAnnotationMode.squiggly => PdfToolbarAction.annotationSquiggly,
          _ => PdfToolbarAction.annotations,
        };
        widget.onTap?.call(action);
      },
      child: Icon(
        icon,
        color: isSelected ? theme.colorScheme.accentForeground : iconColor,
        size: 20,
      ),
    );
  }

  Widget _buildSettingsButton({
    required bool active,
    required IconData icon,
    required String tooltip,
    required VoidCallback onPressed,
    required ShadThemeData theme,
  }) {
    final iconColor = theme.colorScheme.foreground;
    return ShadButton.ghost(
      width: 36,
      height: 36,
      padding: EdgeInsets.zero,
      backgroundColor: active ? theme.colorScheme.accent : null,
      onPressed: onPressed,
      child: Icon(
        icon,
        color: active ? theme.colorScheme.accentForeground : iconColor,
        size: 20,
      ),
    );
  }
}
