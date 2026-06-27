import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/providers/dictionary_package_provider.dart';
import '../../libs/providers/dictionary_providers.dart';

class DictionaryPackageAppBar extends ConsumerWidget implements PreferredSizeWidget {
  const DictionaryPackageAppBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final packagesAsync = ref.watch(dictionaryPackagesProvider);
    final downloadedFilesAsync = ref.watch(localDownloadedDbFilesProvider);

    return SliverAppBar(
      expandedHeight: 140.0,
      pinned: true,
      backgroundColor: theme.brightness == Brightness.dark
          ? theme.colorScheme.card
          : theme.colorScheme.primary,
      iconTheme: const IconThemeData(color: Colors.white),
      titleSpacing: 0,
      flexibleSpace: FlexibleSpaceBar(
        title: Builder(
          builder: (context) {
            final settings = context
                .dependOnInheritedWidgetOfExactType<
                  FlexibleSpaceBarSettings
                >();
            double collapseProgress = 0.0;
            if (settings != null) {
              final deltaExtent = settings.maxExtent - settings.minExtent;
              if (deltaExtent > 0.0) {
                collapseProgress =
                    (1.0 -
                            (settings.currentExtent -
                                    settings.minExtent) /
                                deltaExtent)
                        .clamp(0.0, 1.0);
              }
            }
            final showBadge = collapseProgress > 0.85;
            final opacity = showBadge
                ? (collapseProgress - 0.85) / 0.15
                : 0.0;

            return Row(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Flexible(
                  child: Text(
                    l10n.dictionary.packageList.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (showBadge)
                  Opacity(
                    opacity: opacity.clamp(0.0, 1.0),
                    child: packagesAsync.when(
                      data: (packages) => downloadedFilesAsync.when(
                        data: (downloadedFiles) {
                          final downloadedCount = packages.where((p) {
                            final dbFilename = '${p.packName}.db';
                            return downloadedFiles.contains(dbFilename);
                          }).length;
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '$downloadedCount / ${packages.length}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          );
                        },
                        loading: () => const SizedBox.shrink(),
                        error: (_, _) => const SizedBox.shrink(),
                      ),
                      loading: () => const SizedBox.shrink(),
                      error: (_, _) => const SizedBox.shrink(),
                    ),
                  ),
              ],
            );
          },
        ),
        titlePadding: const EdgeInsets.only(
          left: 48,
          bottom: 14,
          right: 16,
        ),
        background: Container(
          decoration: BoxDecoration(
            color: theme.brightness == Brightness.dark
                ? theme.colorScheme.card
                : theme.colorScheme.primary,
          ),
          child: Stack(
            children: [
              Positioned(
                right: -10,
                bottom: -15,
                child: Icon(
                  LucideIcons.languages,
                  size: 90,
                  color: Colors.white.withValues(alpha: 0.15),
                ),
              ),
              Positioned(
                left: 48,
                bottom: 54,
                child: packagesAsync.when(
                  data: (packages) => downloadedFilesAsync.when(
                    data: (downloadedFiles) {
                      final downloadedCount = packages.where((p) {
                        final dbFilename = '${p.packName}.db';
                        return downloadedFiles.contains(dbFilename);
                      }).length;
                      return Text(
                        l10n.dictionary.packageList.downloadedCount(
                          count: downloadedCount,
                          total: packages.length,
                        ),
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.85),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      );
                    },
                    loading: () => const SizedBox.shrink(),
                    error: (_, _) => const SizedBox.shrink(),
                  ),
                  loading: () => const SizedBox.shrink(),
                  error: (_, _) => const SizedBox.shrink(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(140.0);
}
