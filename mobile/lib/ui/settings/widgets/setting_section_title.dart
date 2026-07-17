import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class SettingSectionTitle extends StatelessWidget {
  final String title;
  final bool isDanger;

  const SettingSectionTitle({
    super.key,
    required this.title,
    this.isDanger = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    return Padding(
      padding: const EdgeInsets.only(left: 4.0),
      child: Text(
        title.toUpperCase(),
        style: theme.textTheme.muted.copyWith(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: isDanger ? theme.colorScheme.destructive : null,
        ),
      ),
    );
  }
}
