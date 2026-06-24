import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class PackageSkeletonItem extends StatefulWidget {
  const PackageSkeletonItem({super.key});

  @override
  State<PackageSkeletonItem> createState() =>
      _PackageSkeletonItemState();
}

class _PackageSkeletonItemState
    extends State<PackageSkeletonItem>
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
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: theme.colorScheme.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: theme.colorScheme.border, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 150,
              height: 18,
              decoration: BoxDecoration(
                color: theme.colorScheme.muted,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              height: 14,
              decoration: BoxDecoration(
                color: theme.colorScheme.muted,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 6),
            Container(
              width: 200,
              height: 14,
              decoration: BoxDecoration(
                color: theme.colorScheme.muted,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  width: 80,
                  height: 12,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.muted,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(width: 16),
                Container(
                  width: 80,
                  height: 12,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.muted,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
