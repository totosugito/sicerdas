import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../core/database/database.dart';
import '../../periodic_screen/widgets/element_styles.dart';

class ElementNavBar extends StatelessWidget {
  final PeriodicElement? previous;
  final PeriodicElement? next;
  final ElementColors elStyle;
  final String periodicTheme;
  final bool isDark;
  final void Function(PeriodicElement) onNavigate;

  const ElementNavBar({
    super.key,
    this.previous,
    this.next,
    required this.elStyle,
    required this.periodicTheme,
    required this.isDark,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    if (previous == null && next == null) {
      return const SliverToBoxAdapter(child: SizedBox.shrink());
    }

    final theme = Theme.of(context);
    final borderColor = elStyle.atomColor.withValues(alpha: 0.6);

    final prevColor = previous != null
        ? getElementStyle(
            previous!.atomicGroup,
            periodicTheme,
            isDark: isDark,
          ).atomColor
        : Colors.transparent;
    final nextColor = next != null
        ? getElementStyle(
            next!.atomicGroup,
            periodicTheme,
            isDark: isDark,
          ).atomColor
        : Colors.transparent;

    return SliverToBoxAdapter(
      child: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(color: borderColor, width: 2),
            bottom: BorderSide(color: theme.dividerColor, width: 0.5),
          ),
          color: theme.cardColor,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            // ── Previous ────────────────────────────────────────────────────
            Expanded(
              child: previous != null
                  ? GestureDetector(
                      onTap: () => onNavigate(previous!),
                      behavior: HitTestBehavior.opaque,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            LucideIcons.chevronLeft,
                            size: 16,
                            color: theme.colorScheme.onSurface.withValues(
                              alpha: 0.5,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${previous!.atomicNumber}',
                            style: TextStyle(
                              fontSize: 13,
                              fontFamily: 'monospace',
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(width: 6),
                          _ColorDot(atomColor: prevColor),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              previous!.atomicName.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 0.6,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    )
                  : const SizedBox.shrink(),
            ),

            // ── Divider ─────────────────────────────────────────────────────
            Container(
              width: 1,
              height: 28,
              margin: const EdgeInsets.symmetric(horizontal: 12),
              color: theme.dividerColor,
            ),

            // ── Next ────────────────────────────────────────────────────────
            Expanded(
              child: next != null
                  ? GestureDetector(
                      onTap: () => onNavigate(next!),
                      behavior: HitTestBehavior.opaque,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Flexible(
                            child: Text(
                              next!.atomicName.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 0.6,
                              ),
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.end,
                            ),
                          ),
                          const SizedBox(width: 6),
                          _ColorDot(atomColor: nextColor),
                          const SizedBox(width: 6),
                          Text(
                            '${next!.atomicNumber}',
                            style: TextStyle(
                              fontSize: 13,
                              fontFamily: 'monospace',
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(
                            LucideIcons.chevronRight,
                            size: 16,
                            color: theme.colorScheme.onSurface.withValues(
                              alpha: 0.5,
                            ),
                          ),
                        ],
                      ),
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}

class _ColorDot extends StatelessWidget {
  final Color atomColor;
  const _ColorDot({required this.atomColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 13,
      height: 13,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: atomColor.withValues(alpha: 0.25),
        border: Border.all(color: atomColor, width: 2),
      ),
    );
  }
}
