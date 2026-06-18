import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../pancasila/pancasila_screen.dart';
import '../pembukaan/pembukaan_screen.dart';
import '../butir_pancasila/butir_pancasila.dart';
import '../uud_1945/uud_1945.dart';
import 'widgets/menu_card.dart';
import 'widgets/menu_app_bar.dart';

class ConstitutionMenuScreen extends ConsumerStatefulWidget {
  const ConstitutionMenuScreen({super.key});

  static void navigate(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ConstitutionMenuScreen()),
    );
  }

  @override
  ConsumerState<ConstitutionMenuScreen> createState() =>
      _ConstitutionMenuScreenState();
}

class _ConstitutionMenuScreenState
    extends ConsumerState<ConstitutionMenuScreen> {
  late final ScrollController _scrollController;
  bool _isCollapsed = false;
  static const double _expandedHeight = 220.0;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_scrollListener);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollListener() {
    if (_scrollController.hasClients) {
      final isCollapsed =
          _scrollController.offset >
          (_expandedHeight -
              kToolbarHeight -
              MediaQuery.of(context).padding.top -
              16);
      if (isCollapsed != _isCollapsed) {
        setState(() {
          _isCollapsed = isCollapsed;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final List<Map<String, dynamic>> menuItems = [
      {
        'title': l10n.constitution.pancasilaTitle,
        'subtitle': l10n.constitution.pancasilaSubtitle,
        'icon': LucideIcons.atom,
        'color': const Color(0xFFEF4444),
        'onTap': () => Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const PancasilaScreen()),
        ),
      },
      {
        'title': l10n.constitution.pembukaanTitle,
        'subtitle': l10n.constitution.pembukaanSubtitle,
        'icon': LucideIcons.scroll,
        'color': const Color(0xFFF59E0B),
        'onTap': () => Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const PembukaanScreen()),
        ),
      },
      {
        'title': l10n.constitution.butirPancasilaTitle,
        'subtitle': l10n.constitution.butirPancasilaSubtitle,
        'icon': LucideIcons.listOrdered,
        'color': const Color(0xFF10B981),
        'onTap': () => Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const ButirPancasilaScreen()),
        ),
      },
      {
        'title': l10n.constitution.uud1945Title,
        'subtitle': l10n.constitution.uud1945Subtitle,
        'icon': LucideIcons.bookOpen,
        'color': const Color(0xFF3B82F6),
        'onTap': () => Uud1945Screen.navigate(context, UudMode.latest),
      },
      {
        'title': l10n.constitution.uud1945AsliTitle,
        'subtitle': l10n.constitution.uud1945AsliSubtitle,
        'icon': LucideIcons.bookmark,
        'color': const Color(0xFF8B5CF6),
        'onTap': () => Uud1945Screen.navigate(context, UudMode.asli),
      },
      {
        'title': l10n.constitution.amandemenTitle,
        'subtitle': l10n.constitution.amandemenSubtitle,
        'icon': LucideIcons.fileCheck2,
        'color': const Color(0xFFEC4899),
        'onTap': () => Uud1945Screen.navigate(context, UudMode.amandemen),
      },
    ];
    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // Pinned Collapsible App Bar
          MenuAppBar(
            isCollapsed: _isCollapsed,
            isDark: isDark,
            expandedHeight: _expandedHeight,
          ),

          // Scrollable Content
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                Text(
                  l10n.constitution.constitution.chooseModule,
                  style: theme.textTheme.large.copyWith(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 16),

                // List of Menu Items
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: EdgeInsets.zero,
                  itemCount: menuItems.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = menuItems[index];
                    final IconData icon = item['icon'] as IconData;
                    final Color color = item['color'] as Color;

                    return MenuCard(
                      title: item['title'] as String,
                      subtitle: item['subtitle'] as String,
                      icon: icon,
                      color: color,
                      onTap: item['onTap'] as VoidCallback,
                    );
                  },
                ),
              ]),
            ),
          ),
          // Extra bottom padding
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}
