import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/core/utils/my_utils.dart';
import '../../libs/providers/dictionary_package_provider.dart';
import '../../libs/model/dictionary_package.dart';

class PackageItem extends ConsumerWidget {
  final DictionaryPackage package;
  final bool isDownloaded;
  final bool isActive;
  final double? downloadProgress;

  const PackageItem({
    super.key,
    required this.package,
    required this.isDownloaded,
    required this.isActive,
    required this.downloadProgress,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDownloading = downloadProgress != null;
    final dbFilename = '${package.packName}.db';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: theme.colorScheme.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.border, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title & Compact Buttons
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              package.packTitle,
                              style: theme.textTheme.large.copyWith(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              package.packDesc,
                              style: theme.textTheme.muted.copyWith(
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Action buttons
                      if (isDownloaded) ...[
                        if (isActive)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary.withValues(
                                alpha: 0.1,
                              ),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: theme.colorScheme.primary.withValues(
                                  alpha: 0.2,
                                ),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  LucideIcons.check,
                                  size: 12,
                                  color: theme.colorScheme.primary,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  l10n.dictionary.packageList.active,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: theme.colorScheme.primary,
                                  ),
                                ),
                              ],
                            ),
                          )
                        else
                          ShadButton(
                            size: ShadButtonSize.sm,
                            onPressed: () async {
                              await ref
                                  .read(activeDictionaryDbProvider.notifier)
                                  .setActiveDb(dbFilename);
                            },
                            child: Text(l10n.dictionary.packageList.activate),
                          ),
                        const SizedBox(width: 6),
                        ShadButton.outline(
                          size: ShadButtonSize.sm,
                          hoverBackgroundColor: theme.colorScheme.destructive
                              .withValues(alpha: 0.1),
                          onPressed: () {
                            showShadDialog(
                              context: context,
                              builder: (context) => ShadDialog(
                                title: Text(
                                  l10n
                                      .dictionary
                                      .packageList
                                      .confirmDeleteTitle,
                                ),
                                description: Text(
                                  l10n.dictionary.packageList.confirmDeleteDesc(
                                    title: package.packTitle,
                                  ),
                                ),
                                actions: [
                                  ShadButton.ghost(
                                    onPressed: () => Navigator.pop(context),
                                    child: Text(l10n.common.cancel),
                                  ),
                                  ShadButton.destructive(
                                    onPressed: () async {
                                      Navigator.pop(context);
                                      await ref
                                          .read(
                                            dictionaryPackageManagerProvider,
                                          )
                                          .deletePackage(package);
                                    },
                                    child: Text(
                                      l10n.dictionary.packageList.delete,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                          child: Icon(
                            LucideIcons.trash2,
                            size: 14,
                            color: theme.colorScheme.destructive,
                          ),
                        ),
                      ] else
                        ShadButton(
                          size: ShadButtonSize.sm,
                          enabled: !isDownloading,
                          onPressed: () async {
                            await ref
                                .read(dictionaryPackageManagerProvider)
                                .downloadAndExtract(package);
                          },
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(LucideIcons.download, size: 14),
                              const SizedBox(width: 4),
                              Text(l10n.dictionary.packageList.download),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Info Row
                  Row(
                    children: [
                      Icon(
                        LucideIcons.calendar,
                        size: 13,
                        color: theme.colorScheme.mutedForeground,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        l10n.dictionary.packageList.releaseDate(
                          date: package.packReleaseDate,
                        ),
                        style: theme.textTheme.small.copyWith(
                          color: theme.colorScheme.mutedForeground,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Icon(
                        LucideIcons.database,
                        size: 13,
                        color: theme.colorScheme.mutedForeground,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        l10n.dictionary.packageList.fileSize(
                          size: MyUtils.formatFileSize(package.packFileSize),
                        ),
                        style: theme.textTheme.small.copyWith(
                          color: theme.colorScheme.mutedForeground,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Words info badges
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: package.packWordInfo.map((info) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.muted,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          info,
                          style: TextStyle(
                            fontSize: 11,
                            color: theme.colorScheme.mutedForeground,
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  // Download progress bar
                  if (isDownloading) ...[
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: downloadProgress,
                        backgroundColor: theme.colorScheme.muted,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          theme.colorScheme.primary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          l10n.dictionary.packageList.downloading(
                            progress: (downloadProgress! * 100).toStringAsFixed(
                              0,
                            ),
                          ),
                          style: theme.textTheme.small.copyWith(
                            color: theme.colorScheme.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            ref
                                .read(dictionaryPackageManagerProvider)
                                .cancelDownload(package.packName);
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              vertical: 2,
                              horizontal: 8,
                            ),
                            child: Text(
                              l10n.common.cancel,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.destructive,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            // Screenshots Gallery Section
            if (package.packSampleScreen.isNotEmpty) ...[
              const Divider(height: 1, thickness: 1),
              Padding(
                padding: const EdgeInsets.only(
                  top: 12.0,
                  left: 16.0,
                  right: 16.0,
                  bottom: 4.0,
                ),
                child: Text(
                  l10n.dictionary.packageList.screenshots(
                    count: package.packSampleScreen.length,
                  ),
                  style: theme.textTheme.small.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
              SizedBox(
                height: 140,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  scrollDirection: Axis.horizontal,
                  itemCount: package.packSampleScreen.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final imageUrl = package.packSampleScreen[index];
                    return GestureDetector(
                      onTap: () => _showImageDialog(context, imageUrl),
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: theme.colorScheme.border,
                            width: 1,
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(7),
                          child: Hero(
                            tag: imageUrl,
                            child: Image.network(
                              imageUrl,
                              width: 80,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  Container(
                                    width: 80,
                                    color: theme.colorScheme.muted,
                                    child: const Icon(
                                      LucideIcons.imageOff,
                                      size: 20,
                                    ),
                                  ),
                              loadingBuilder:
                                  (context, child, loadingProgress) {
                                    if (loadingProgress == null) return child;
                                    return Container(
                                      width: 80,
                                      color: theme.colorScheme.muted,
                                      child: const Center(
                                        child: SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 8),
            ],
          ],
        ),
      ),
    );
  }

  void _showImageDialog(BuildContext context, String imageUrl) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(16),
        child: Stack(
          alignment: Alignment.center,
          children: [
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: InteractiveViewer(
                minScale: 0.5,
                maxScale: 3.0,
                child: Hero(
                  tag: imageUrl,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(imageUrl, fit: BoxFit.contain),
                  ),
                ),
              ),
            ),
            Positioned(
              top: 16,
              right: 16,
              child: FloatingActionButton.small(
                backgroundColor: Colors.black54,
                foregroundColor: Colors.white,
                onPressed: () => Navigator.pop(context),
                child: const Icon(LucideIcons.x),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
