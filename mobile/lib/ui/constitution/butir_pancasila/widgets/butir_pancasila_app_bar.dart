import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';

class ButirPancasilaAppBar extends StatelessWidget {
  final bool isCollapsed;
  final bool isDark;
  final double expandedHeight;
  final bool expandedAll;
  final VoidCallback onToggleExpandAll;

  const ButirPancasilaAppBar({
    super.key,
    required this.isCollapsed,
    required this.isDark,
    required this.expandedHeight,
    required this.expandedAll,
    required this.onToggleExpandAll,
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
      title: AnimatedOpacity(
        duration: const Duration(milliseconds: 150),
        opacity: isCollapsed ? 1.0 : 0.0,
        child: Text(
          l10n.constitution.butirPancasilaTitle,
          style: theme.textTheme.large.copyWith(
            color: theme.colorScheme.foreground,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      centerTitle: false,
      actions: [
        IconButton(
          icon: Icon(
            expandedAll ? LucideIcons.chevronUp : LucideIcons.chevronDown,
            color: theme.colorScheme.foreground,
          ),
          onPressed: onToggleExpandAll,
        ),
      ],
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
          background: AnimatedOpacity(
            duration: const Duration(milliseconds: 150),
            opacity: isCollapsed ? 0.0 : 1.0,
            child: Padding(
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 24,
                bottom: 0,
                left: 16,
                right: 16,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: theme.colorScheme.destructive
                          .withValues(alpha: 0.05),
                      border: Border.all(
                        color: theme.colorScheme.destructive.withValues(
                          alpha: isDark ? 0.2 : 0.1,
                        ),
                        width: 1.5,
                      ),
                    ),
                    child: Image.asset(
                      'assets/constitution/images/ic_pancasila.png',
                      width: 48,
                      height: 48,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    l10n.constitution.butirPancasilaTitle,
                    style: theme.textTheme.h3.copyWith(
                      color: theme.colorScheme.foreground,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    l10n.constitution.butirPancasilaSubtitle,
                    style: theme.textTheme.muted.copyWith(
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
