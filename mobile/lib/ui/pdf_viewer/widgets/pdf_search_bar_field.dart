import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class PdfSearchBarField extends StatelessWidget {
  final TextEditingController controller;
  final String placeholder;
  final ValueChanged<String> onSubmitted;

  const PdfSearchBarField({
    super.key,
    required this.controller,
    required this.placeholder,
    required this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return ShadInput(
      controller: controller,
      autofocus: true,
      placeholder: Text(
        placeholder,
        style: theme.textTheme.p.copyWith(
          color: theme.colorScheme.mutedForeground,
        ),
      ),
      style: theme.textTheme.p.copyWith(
        color: theme.colorScheme.foreground,
      ),
      onSubmitted: onSubmitted,
      decoration: ShadDecoration(
        border: ShadBorder.all(
          width: 0,
          color: Colors.transparent,
        ),
        focusedBorder: ShadBorder.all(
          width: 0,
          color: Colors.transparent,
        ),
      ),
    );
  }
}
