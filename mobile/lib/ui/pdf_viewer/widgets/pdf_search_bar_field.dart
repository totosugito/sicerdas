import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class PdfSearchBarField extends StatefulWidget {
  final TextEditingController controller;
  final String placeholder;
  final ValueChanged<String> onSubmitted;
  final bool caseSensitive;
  final bool wholeWords;
  final ValueChanged<bool> onCaseSensitiveChanged;
  final ValueChanged<bool> onWholeWordsChanged;

  const PdfSearchBarField({
    super.key,
    required this.controller,
    required this.placeholder,
    required this.onSubmitted,
    required this.caseSensitive,
    required this.wholeWords,
    required this.onCaseSensitiveChanged,
    required this.onWholeWordsChanged,
  });

  @override
  State<PdfSearchBarField> createState() => _PdfSearchBarFieldState();
}

class _PdfSearchBarFieldState extends State<PdfSearchBarField> {
  bool _showClearButton = false;

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onTextChanged);
    _showClearButton = widget.controller.text.isNotEmpty;
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onTextChanged);
    super.dispose();
  }

  void _onTextChanged() {
    final hasText = widget.controller.text.isNotEmpty;
    if (hasText != _showClearButton) {
      setState(() {
        _showClearButton = hasText;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return Container(
      height: 40,
      decoration: BoxDecoration(
        color: theme.colorScheme.muted.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: theme.colorScheme.border.withValues(alpha: 0.5),
          width: 1,
        ),
      ),
      padding: const EdgeInsets.only(left: 12, right: 8),
      alignment: Alignment.center,
      child: ShadInput(
        controller: widget.controller,
        autofocus: true,
        padding: EdgeInsets.zero,
        placeholder: Text(
          widget.placeholder,
          style: theme.textTheme.small.copyWith(
            color: theme.colorScheme.mutedForeground,
          ),
        ),
        style: theme.textTheme.small.copyWith(
          color: theme.colorScheme.foreground,
        ),
        onSubmitted: widget.onSubmitted,
        leading: Padding(
          padding: const EdgeInsets.only(right: 8),
          child: Icon(
            Icons.search,
            size: 18,
            color: theme.colorScheme.mutedForeground,
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            GestureDetector(
              onTap: () => widget.onCaseSensitiveChanged(!widget.caseSensitive),
              behavior: HitTestBehavior.opaque,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 6.0,
                  vertical: 4.0,
                ),
                child: Text(
                  'Aa',
                  style: theme.textTheme.small.copyWith(
                    fontWeight: FontWeight.bold,
                    color: widget.caseSensitive
                        ? theme.colorScheme.primary
                        : theme.colorScheme.mutedForeground,
                  ),
                ),
              ),
            ),
            GestureDetector(
              onTap: () => widget.onWholeWordsChanged(!widget.wholeWords),
              behavior: HitTestBehavior.opaque,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 6.0,
                  vertical: 4.0,
                ),
                child: Text(
                  'W',
                  style: theme.textTheme.small.copyWith(
                    fontWeight: FontWeight.bold,
                    color: widget.wholeWords
                        ? theme.colorScheme.primary
                        : theme.colorScheme.mutedForeground,
                  ),
                ),
              ),
            ),
            if (_showClearButton) ...[
              const SizedBox(width: 4),
              GestureDetector(
                onTap: () {
                  widget.controller.clear();
                  widget.onSubmitted('');
                },
                behavior: HitTestBehavior.opaque,
                child: Padding(
                  padding: const EdgeInsets.all(4.0),
                  child: Icon(
                    Icons.close,
                    size: 16,
                    color: theme.colorScheme.mutedForeground,
                  ),
                ),
              ),
            ],
          ],
        ),
        decoration: ShadDecoration(
          border: ShadBorder.all(width: 0, color: Colors.transparent),
          focusedBorder: ShadBorder.all(width: 0, color: Colors.transparent),
        ),
      ),
    );
  }
}
