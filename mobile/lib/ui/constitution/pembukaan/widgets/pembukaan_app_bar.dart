import 'package:flutter/material.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';

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
    final l10n = AppLocalizations.of(context)!;

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
              l10n.pembukaanTitle,
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
                // Garuda Logo in circular frame
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
                  'UNDANG-UNDANG DASAR',
                  style: TextStyle(
                    color: isDark ? Colors.white : const Color(0xFF1A202C),
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'NEGARA REPUBLIK INDONESIA TAHUN 1945',
                  style: TextStyle(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.8)
                        : const Color(0xFF2D3748),
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.2,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Text(
                  'PEMBUKAAN',
                  style: TextStyle(
                    color: isDark ? Colors.white : const Color(0xFF1A202C),
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
