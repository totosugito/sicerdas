import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/widgets/ads/ads_banner.dart';
import '../libs/providers/dictionary_package_provider.dart';
import 'widgets/package_item.dart';
import 'widgets/package_skeleton_item.dart';

class DictionaryPackageListScreen extends ConsumerWidget {
  const DictionaryPackageListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final packagesAsync = ref.watch(dictionaryPackagesProvider);
    final downloadedFilesAsync = ref.watch(localDownloadedDbFilesProvider);
    final activeDbVal = ref.watch(activeDictionaryDbProvider);
    final downloadProgress = ref.watch(dictionaryDownloadProgressProvider);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: CustomScrollView(
        slivers: [
          // Collapsible Header
          SliverAppBar(
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
          ),

          // Description Text
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            sliver: SliverToBoxAdapter(
              child: Text(
                l10n.dictionary.packageList.desc,
                style: theme.textTheme.muted.copyWith(fontSize: 14),
              ),
            ),
          ),

          // Warning Banner
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: activeDbVal.when(
                data: (activePath) {
                  if (activePath == null) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 16, top: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.destructive.withValues(
                          alpha: 0.1,
                        ),
                        border: Border.all(
                          color: theme.colorScheme.destructive.withValues(
                            alpha: 0.3,
                          ),
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            LucideIcons.triangleAlert,
                            color: theme.colorScheme.destructive,
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              l10n.dictionary.packageList.noDbWarning,
                              style: TextStyle(
                                color: theme.colorScheme.destructive,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }
                  return const SizedBox.shrink();
                },
                loading: () => const SizedBox.shrink(),
                error: (_, _) => const SizedBox.shrink(),
              ),
            ),
          ),

          // Packages List / Loading / Error
          packagesAsync.when(
            data: (packages) {
              if (packages.isEmpty) {
                return const SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(child: Text("No packages available")),
                );
              }

              return downloadedFilesAsync.when(
                data: (downloadedFiles) {
                  return SliverPadding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 8.0,
                    ),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        final package = packages[index];
                        final dbFilename = '${package.packName}.db';
                        final isDownloaded = downloadedFiles.contains(
                          dbFilename,
                        );
                        final isActive =
                            activeDbVal.value != null &&
                            activeDbVal.value!.endsWith(dbFilename);
                        final progress = downloadProgress[package.packName];

                        return PackageItem(
                          package: package,
                          isDownloaded: isDownloaded,
                          isActive: isActive,
                          downloadProgress: progress,
                        );
                      }, childCount: packages.length),
                    ),
                  );
                },
                loading: () => SliverPadding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16.0,
                    vertical: 8.0,
                  ),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => const PackageSkeletonItem(),
                      childCount: 3,
                    ),
                  ),
                ),
                error: (err, stack) => SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(child: Text(err.toString())),
                ),
              );
            },
            loading: () => SliverPadding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 8.0,
              ),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) => const PackageSkeletonItem(),
                  childCount: 3,
                ),
              ),
            ),
            error: (err, stack) => SliverFillRemaining(
              hasScrollBody: false,
              child: Center(
                child: Text(
                  l10n.dictionary.errorOccurred(error: err.toString()),
                  style: TextStyle(color: theme.colorScheme.destructive),
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: AdsBanner.buildBottomBar(ref),
    );
  }
}
