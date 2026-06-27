import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:path/path.dart' as p;
import '../../libs/providers/dictionary_providers.dart';
import '../../libs/providers/dictionary_package_provider.dart';
import '../../libs/model/dictionary_package.dart';
import '../../dictionary_package/dictionary_package_list.dart';

class DictionaryAppBar extends ConsumerWidget {
  const DictionaryAppBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);

    final activeDbVal = ref.watch(activeDictionaryDbProvider);
    final isSwap = ref.watch(dictionaryIsSwapProvider);
    final favoritesOnly = ref.watch(dictionaryFavoritesOnlyProvider);
    final packagesAsync = ref.watch(dictionaryPackagesProvider);
    final localDbsAsync = ref.watch(localDownloadedDbFilesProvider);

    final activePath = activeDbVal.value;
    final localDbs = localDbsAsync.value ?? [];

    if (activePath == null) {
      return const SliverToBoxAdapter(child: SizedBox.shrink());
    }

    final packages = packagesAsync.value ?? [];
    final activeFilename = p.basename(activePath);
    final activePackage = packages.firstWhere(
      (pkg) => '${pkg.packName}.db' == activeFilename,
      orElse: () => DictionaryPackage(
        packId: -1,
        packName: '',
        packReleaseDate: '',
        packFileSize: 0,
        packTitle: l10n.dictionary.title,
        packSource: '',
        packDesc: '',
        packUrl: '',
        packWordInfo: [],
        packSampleScreen: [],
      ),
    );

    final activeDisplayTitle = _getDictionaryLabel(
      filename: activeFilename,
      package: activePackage,
      isSwap: isSwap,
      l10n: l10n,
    );

    // Precompute the popup menu items for the database selector
    final List<PopupMenuEntry<String>> popupMenuItems = [];
    final menuOptions = _getDbMenuOptions(
      localDbs: localDbs,
      activeFilename: activeFilename,
      packages: packages,
      isSwap: isSwap,
      l10n: l10n,
    );

    for (final option in menuOptions) {
      popupMenuItems.add(
        PopupMenuItem<String>(
          value: option.value,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(option.label, overflow: TextOverflow.ellipsis),
              ),
              if (option.isActive) ...[
                const SizedBox(width: 8),
                Icon(
                  LucideIcons.check,
                  size: 16,
                  color: theme.colorScheme.foreground,
                ),
              ],
            ],
          ),
        ),
      );
    }

    popupMenuItems.add(const PopupMenuDivider());
    popupMenuItems.add(
      PopupMenuItem<String>(
        value: '__manage__',
        child: Row(
          children: [
            Icon(
              LucideIcons.settings,
              size: 16,
              color: theme.colorScheme.foreground,
            ),
            const SizedBox(width: 8),
            Text(l10n.dictionary.packageList.title),
          ],
        ),
      ),
    );

    return SliverAppBar(
      expandedHeight: 140.0,
      pinned: true,
      backgroundColor: theme.brightness == Brightness.dark
          ? theme.colorScheme.card
          : theme.colorScheme.primary,
      iconTheme: const IconThemeData(color: Colors.white),
      titleSpacing: 0,
      actions: [
        IconButton(
          icon: Icon(
            favoritesOnly ? LucideIcons.bookmarkCheck : LucideIcons.bookmark,
          ),
          tooltip: favoritesOnly
              ? l10n.dictionary.all
              : l10n.dictionary.favoritesOnly,
          onPressed: () {
            ref.read(dictionaryFavoritesOnlyProvider.notifier).toggle();
          },
        ),
        PopupMenuButton<String>(
          icon: const Icon(LucideIcons.database),
          tooltip: l10n.dictionary.packageList.title,
          onSelected: (value) async {
            if (value == '__manage__') {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const DictionaryPackageListScreen(),
                ),
              );
            } else {
              final parts = value.split('|');
              final dbFile = parts[0];
              final isSwap = parts.length > 1 && parts[1] == 'true';

              await ref
                  .read(activeDictionaryDbProvider.notifier)
                  .setActiveDb(dbFile);

              ref.read(dictionaryIsSwapProvider.notifier).setSwap(isSwap);
            }
          },
          itemBuilder: (context) => popupMenuItems,
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          activeDisplayTitle,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
          overflow: TextOverflow.ellipsis,
        ),
        titlePadding: const EdgeInsets.only(left: 48, bottom: 14, right: 48),
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
                  LucideIcons.bookOpen,
                  size: 90,
                  color: Colors.white.withValues(alpha: 0.15),
                ),
              ),
              if (activeDisplayTitle != l10n.dictionary.title)
                Positioned(
                  left: 48,
                  bottom: 54,
                  child: Text(
                    l10n.dictionary.title,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  String _getDictionaryLabel({
    required String filename,
    required DictionaryPackage package,
    required bool isSwap,
    required Translations l10n,
  }) {
    final nameWithoutExt = filename.split('.').first;
    final pParts = nameWithoutExt.split('_');
    if (pParts.length >= 3) {
      final code1 = pParts[1].toLowerCase();
      final code2 = pParts[2].toLowerCase();

      const dictMap = {"id": "Indonesia", "en": "English", "kb": "KBBI"};
      final lang1 = dictMap[code1] ?? code1.toUpperCase();
      final lang2 = dictMap[code2] ?? code2.toUpperCase();

      if (code1 != code2) {
        return isSwap ? '$lang2 ➔ $lang1' : '$lang1 ➔ $lang2';
      } else {
        return package.packTitle.isNotEmpty ? package.packTitle : lang1;
      }
    }
    return package.packTitle.isNotEmpty
        ? package.packTitle
        : l10n.dictionary.title;
  }

  List<_DbMenuOption> _getDbMenuOptions({
    required List<String> localDbs,
    required String activeFilename,
    required List<DictionaryPackage> packages,
    required bool isSwap,
    required Translations l10n,
  }) {
    final List<_DbMenuOption> options = [];

    for (final dbFile in localDbs) {
      final dbNameWithoutExt = dbFile.split('.').first;
      final pParts = dbNameWithoutExt.split('_');
      final isActiveDb = dbFile == activeFilename;

      final pkg = packages.firstWhere(
        (p) => p.packName == dbNameWithoutExt,
        orElse: () => DictionaryPackage(
          packId: -1,
          packName: dbNameWithoutExt,
          packReleaseDate: '',
          packFileSize: 0,
          packTitle: '',
          packSource: '',
          packDesc: '',
          packUrl: '',
          packWordInfo: [],
          packSampleScreen: [],
        ),
      );

      if (pParts.length >= 3 &&
          pParts[1].toLowerCase() != pParts[2].toLowerCase()) {
        options.add(
          _DbMenuOption(
            label: _getDictionaryLabel(
              filename: dbFile,
              package: pkg,
              isSwap: false,
              l10n: l10n,
            ),
            value: '$dbFile|false',
            isActive: isActiveDb && !isSwap,
          ),
        );
        options.add(
          _DbMenuOption(
            label: _getDictionaryLabel(
              filename: dbFile,
              package: pkg,
              isSwap: true,
              l10n: l10n,
            ),
            value: '$dbFile|true',
            isActive: isActiveDb && isSwap,
          ),
        );
      } else {
        options.add(
          _DbMenuOption(
            label: _getDictionaryLabel(
              filename: dbFile,
              package: pkg,
              isSwap: false,
              l10n: l10n,
            ),
            value: '$dbFile|false',
            isActive: isActiveDb,
          ),
        );
      }
    }
    return options;
  }
}

class _DbMenuOption {
  final String label;
  final String value;
  final bool isActive;

  const _DbMenuOption({
    required this.label,
    required this.value,
    required this.isActive,
  });
}
