import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/core/providers/database_provider.dart';
import '../libs/providers/dictionary_package_provider.dart';
import 'widgets/dictionary_package_item.dart';

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
      appBar: AppBar(
        title: Text(
          l10n.dictionary.packageList.title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: theme.colorScheme.foreground,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                l10n.dictionary.packageList.desc,
                style: theme.textTheme.muted.copyWith(fontSize: 14),
              ),
              const SizedBox(height: 16),
              
              // No Active DB Warning
              activeDbVal.when(
                data: (activePath) {
                  if (activePath == null) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.destructive.withValues(alpha: 0.1),
                        border: Border.all(color: theme.colorScheme.destructive.withValues(alpha: 0.3)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(LucideIcons.triangleAlert, color: theme.colorScheme.destructive, size: 20),
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
                error: (_, __) => const SizedBox.shrink(),
              ),

              Expanded(
                child: packagesAsync.when(
                  data: (packages) {
                    if (packages.isEmpty) {
                      return const Center(child: Text("No packages available"));
                    }

                    return downloadedFilesAsync.when(
                      data: (downloadedFiles) {
                        return ListView.separated(
                          itemCount: packages.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final package = packages[index];
                            final dbFilename = '${package.packName}.db';
                            final isDownloaded = downloadedFiles.contains(dbFilename);
                            final isActive = activeDbVal.value != null && 
                                             activeDbVal.value!.endsWith(dbFilename);
                            final progress = downloadProgress[package.packName];

                            return DictionaryPackageItem(
                              package: package,
                              isDownloaded: isDownloaded,
                              isActive: isActive,
                              downloadProgress: progress,
                            );
                          },
                        );
                      },
                      loading: () => const Center(child: CircularProgressIndicator()),
                      error: (err, stack) => Center(child: Text(err.toString())),
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (err, stack) => Center(
                    child: Text(
                      l10n.dictionary.errorOccurred(error: err.toString()),
                      style: TextStyle(color: theme.colorScheme.destructive),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
