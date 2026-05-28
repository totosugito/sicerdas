import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../core/providers/navigation_provider.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';

import '../../periodic-table/periodic-screen/periodic_screen.dart';

class QuickAccessGrid extends ConsumerWidget {
  const QuickAccessGrid({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;

    final modules = [
      {
        'title': l10n.digitalBooks,
        'icon': Icons.menu_book_rounded,
        'colors': [const Color(0xFF6366F1), const Color(0xFF8B5CF6)],
        'onTap': () {
          ref.read(navigationProvider.notifier).setIndex(1);
        },
      },
      {
        'title': l10n.periodicTable,
        'icon': Icons.science_rounded,
        'colors': [const Color(0xFFF59E0B), const Color(0xFFD97706)],
        'onTap': () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const PeriodicScreen()),
          );
        },
      },
      {
        'title': l10n.dictionary,
        'icon': Icons.translate_rounded,
        'colors': [const Color(0xFFEC4899), const Color(0xFFDB2777)],
        'onTap': () {
          ref.read(navigationProvider.notifier).setIndex(2);
        },
      },
      {
        'title': l10n.aiAssistant,
        'icon': Icons.auto_awesome_rounded,
        'colors': [const Color(0xFF10B981), const Color(0xFF059669)],
        'onTap': () {
          ShadToaster.of(context).show(
            ShadToast(
              title: Text(l10n.aiAssistant),
              description: const Text('Feature under development'),
            ),
          );
        },
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 2.2, // Much sleeker, horizontal cards
      ),
      itemCount: modules.length,
      itemBuilder: (context, index) {
        final module = modules[index];
        final colors = module['colors'] as List<Color>;

        return _SleekActionCard(
          title: module['title'] as String,
          icon: module['icon'] as IconData,
          gradient: colors,
          onTap: module['onTap'] as VoidCallback,
        );
      },
    );
  }
}

class _SleekActionCard extends StatefulWidget {
  final String title;
  final IconData icon;
  final List<Color> gradient;
  final VoidCallback onTap;

  const _SleekActionCard({
    required this.title,
    required this.icon,
    required this.gradient,
    required this.onTap,
  });

  @override
  State<_SleekActionCard> createState() => _SleekActionCardState();
}

class _SleekActionCardState extends State<_SleekActionCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.96,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = ShadTheme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) => _controller.reverse(),
      onTapCancel: () => _controller.reverse(),
      onTap: widget.onTap,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: isDark
                ? widget.gradient[0].withValues(alpha: 0.1)
                : Colors.white,
            boxShadow: [
              BoxShadow(
                color: widget.gradient[0].withValues(alpha: isDark ? 0.0 : 0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
            border: Border.all(
              color: widget.gradient[0].withValues(alpha: isDark ? 0.3 : 0.1),
              width: 1,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Stack(
              children: [
                // Subtle decorative gradient hint
                Positioned(
                  right: -20,
                  top: -20,
                  child: Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [
                          widget.gradient[0].withValues(alpha: 0.1),
                          widget.gradient[1].withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: widget.gradient,
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            widget.icon,
                            size: 20,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            widget.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: isDark
                                  ? Colors.white.withValues(alpha: 0.9)
                                  : Colors.black87,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
