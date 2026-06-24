import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class WordSkeletonItem extends StatefulWidget {
  const WordSkeletonItem({super.key});

  @override
  State<WordSkeletonItem> createState() => _WordSkeletonItemState();
}

class _WordSkeletonItemState extends State<WordSkeletonItem>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.4, end: 0.9).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    return FadeTransition(
      opacity: _animation,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 120,
                    height: 16,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.muted,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 220,
                    height: 14,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.muted,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: theme.colorScheme.muted,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
