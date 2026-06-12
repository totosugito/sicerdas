import 'dart:io';
import 'package:bse/core/database/database.dart';
import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/models/periodic_models.dart';
import '../../libs/utils/periodic_utils.dart';
import '../../periodic_screen/widgets/element_styles.dart';
import '../../element_isotope/element_isotope.dart';

class DetailAppBar extends StatelessWidget {
  final PeriodicElement element;
  final AtomicProperties atomicProperties;
  final ElementColors elStyle;
  final Color atomColor;
  final String? imagePath;
  final bool isCollapsed;
  final bool isDark;

  final bool isAllExpanded;
  final VoidCallback? onToggleExpandCollapse;

  const DetailAppBar({
    super.key,
    required this.element,
    required this.atomicProperties,
    required this.elStyle,
    required this.atomColor,
    required this.isCollapsed,
    required this.isDark,
    required this.isAllExpanded,
    this.onToggleExpandCollapse,
    this.imagePath,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);
    final appBarColor = isCollapsed
        ? (isDark ? Colors.white : Colors.black87)
        : Colors.white;

    return SliverAppBar(
      expandedHeight: 340.0,
      pinned: true,
      leading: IconButton(
        icon: Icon(LucideIcons.arrowLeft, color: appBarColor),
        onPressed: () => Navigator.of(context).pop(),
      ),
      backgroundColor: elStyle.background,
      actions: [
        IconButton(
          icon: Icon(LucideIcons.globe, color: appBarColor),
          onPressed: () async {
            final url = Uri.parse(
              PeriodicUtils.getElementUrl(element.atomicNumber),
            );
            if (await canLaunchUrl(url)) {
              await launchUrl(url, mode: LaunchMode.externalApplication);
            } else {
              try {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              } catch (e) {
                debugPrint('Could not launch $url: $e');
              }
            }
          },
        ),
        IconButton(
          icon: Icon(LucideIcons.atom, color: appBarColor),
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => ElementIsotopeScreen(element: element),
              ),
            );
          },
        ),
        IconButton(
          icon: Icon(
            isAllExpanded ? LucideIcons.chevronUp : LucideIcons.chevronDown,
            color: appBarColor,
          ),
          onPressed: onToggleExpandCollapse,
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        centerTitle: false,
        titlePadding: const EdgeInsets.only(left: 56, bottom: 16),
        title: AnimatedOpacity(
          duration: const Duration(milliseconds: 150),
          opacity: isCollapsed ? 1.0 : 0.0,
          child: Text(
            "${element.atomicName} [${element.atomicSymbol}]",
            style: TextStyle(
              color: isDark ? Colors.white : Colors.black87,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
        ),
        background: Stack(
          fit: StackFit.expand,
          children: [
            if (imagePath != null)
              Image.file(File(imagePath!), fit: BoxFit.cover)
            else
              Container(
                decoration: BoxDecoration(
                  gradient: elStyle.gradient != null
                      ? LinearGradient(
                          colors: elStyle.gradient!,
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        )
                      : null,
                  color: elStyle.gradient == null ? elStyle.background : null,
                ),
              ),
            // Dark overlay gradient to make text readable
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.black.withValues(alpha: 0.35),
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.8),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
            // Overlay elements (bottom left)
            Positioned(
              left: 16,
              bottom: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Colored Group Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(color: atomColor),
                    child: Text(
                      "${element.atomicNumber}  |  ${PeriodicUtils.getLocalizedSeries(l10n, element.atomicGroup)}",
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Symbol, Name, and Atomic Weight
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        element.atomicSymbol,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 48,
                          fontWeight: FontWeight.w300,
                          height: 0.9,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            element.atomicName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              height: 1.0,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "${atomicProperties.atomicWeight ?? ''} g/mol",
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
