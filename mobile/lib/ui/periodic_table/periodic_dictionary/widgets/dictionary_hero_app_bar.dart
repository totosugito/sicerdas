import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class DictionaryHeroAppBar extends StatelessWidget {
  final String title;
  final String description;

  const DictionaryHeroAppBar({
    super.key,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return SliverAppBar(
      expandedHeight: 150.0,
      pinned: true,
      backgroundColor: theme.brightness == Brightness.dark
          ? theme.colorScheme.card
          : theme.colorScheme.primary,
      iconTheme: const IconThemeData(color: Colors.white),
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        titlePadding: const EdgeInsets.only(left: 48, bottom: 14),
        background: Container(
          decoration: BoxDecoration(
            color: theme.brightness == Brightness.dark
                ? theme.colorScheme.card
                : theme.colorScheme.primary,
          ),
          child: Stack(
            children: [
              Positioned(
                right: -10,
                bottom: -15,
                child: Icon(
                  LucideIcons.beaker,
                  size: 90,
                  color: Colors.white.withValues(alpha: 0.15),
                ),
              ),
              Positioned(
                left: 48,
                bottom: 54,
                child: Text(
                  description,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.85),
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
