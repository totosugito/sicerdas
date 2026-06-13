import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';

class PembukaanAppBar extends StatelessWidget {
  final bool isCollapsed;
  final bool isDark;
  final double expandedHeight;

  const PembukaanAppBar({
    super.key,
    required this.isCollapsed,
    required this.isDark,
    required this.expandedHeight,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);

    final backgroundColor = theme.colorScheme.background;
    final redHint = theme.colorScheme.destructive.withValues(
      alpha: isDark ? 0.08 : 0.04,
    );

    return SliverAppBar(
      expandedHeight: expandedHeight,
      pinned: true,
      elevation: 0,
      backgroundColor: Colors.transparent,
      leading: IconButton(
        icon: Icon(
          Icons.arrow_back_rounded,
          color: theme.colorScheme.foreground,
        ),
        onPressed: () => Navigator.of(context).pop(),
      ),
      // Header bottom border when collapsed
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1.5),
        child: Container(
          color: theme.colorScheme.destructive.withValues(
            alpha: isDark ? 0.3 : 0.15,
          ),
          height: 1.5,
        ),
      ),
      flexibleSpace: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color.alphaBlend(redHint, backgroundColor),
              backgroundColor,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: FlexibleSpaceBar(
          centerTitle: false,
          title: AnimatedOpacity(
            duration: const Duration(milliseconds: 150),
            opacity: isCollapsed ? 1.0 : 0.0,
            child: Text(
              l10n.constitution.pembukaanTitle,
              style: theme.textTheme.large.copyWith(
                color: theme.colorScheme.foreground,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          background: Padding(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 28,
              bottom: 0,
              left: 10,
              right: 10,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Garuda Logo in circular frame
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: theme.colorScheme.destructive.withValues(alpha: 0.05),
                    border: Border.all(
                      color: theme.colorScheme.destructive.withValues(
                        alpha: isDark ? 0.2 : 0.1,
                      ),
                      width: 1.5,
                    ),
                  ),
                  child: Image.asset(
                    'assets/constitution/images/ic_pancasila.png',
                    width: 52,
                    height: 52,
                    fit: BoxFit.contain,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'UNDANG-UNDANG DASAR',
                  style: theme.textTheme.h3.copyWith(
                    color: theme.colorScheme.foreground,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'NEGARA REPUBLIK INDONESIA TAHUN 1945',
                  style: theme.textTheme.muted.copyWith(
                    color: theme.colorScheme.foreground.withValues(
                      alpha: isDark ? 0.9 : 0.8,
                    ),
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.2,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Text(
                  'PEMBUKAAN',
                  style: theme.textTheme.h3.copyWith(
                    color: theme.colorScheme.foreground,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
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

