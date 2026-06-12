import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';

class MenuAppBar extends StatelessWidget {
  final bool isCollapsed;
  final bool isDark;
  final double expandedHeight;

  const MenuAppBar({
    super.key,
    required this.isCollapsed,
    required this.isDark,
    required this.expandedHeight,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);

    return SliverAppBar(
      expandedHeight: expandedHeight,
      pinned: true,
      elevation: 0,
      backgroundColor: Colors.transparent,
      leading: IconButton(
        icon: Icon(
          Icons.arrow_back_rounded,
          color: isDark ? Colors.white : const Color(0xFF2D3748),
        ),
        onPressed: () => Navigator.of(context).pop(),
      ),
      // Header bottom border when collapsed
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1.5),
        child: Container(
          color: isDark ? const Color(0xFF3E2222) : const Color(0xFFFFD6D6),
          height: 1.5,
        ),
      ),
      flexibleSpace: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: isDark
                ? [const Color(0xFF2E1A1A), const Color(0xFF181010)]
                : [const Color(0xFFFFF5F5), const Color(0xFFFFF0F0)],
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
              l10n.constitution.constitutionTitle,
              style: TextStyle(
                color: isDark ? Colors.white : const Color(0xFF1A202C),
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
                // Icon in circular frame
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.05)
                        : Colors.red.withValues(alpha: 0.05),
                    border: Border.all(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.15)
                          : Colors.red.withValues(alpha: 0.1),
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
                  l10n.constitution.constitutionTitle,
                  style: TextStyle(
                    color: isDark ? Colors.white : const Color(0xFF1A202C),
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  l10n.constitution.constitutionDesc,
                  style: TextStyle(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.7)
                        : const Color(0xFF4A5568),
                    fontSize: 12,
                    height: 1.3,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
