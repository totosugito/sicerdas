import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../core/providers/books_provider.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';
import 'widgets/category_card.dart';

class GroupBookScreen extends ConsumerWidget {
  const GroupBookScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final categoriesAsync = ref.watch(categoriesProvider);
    final allGroupsAsync = ref.watch(allGroupsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.browseGroups, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: ShadTheme.of(context).colorScheme.foreground,
      ),
      body: categoriesAsync.when(
        data: (categories) => allGroupsAsync.when(
          data: (groups) {
            if (categories.isEmpty) {
              return Center(child: Text(l10n.noCategoriesFound));
            }

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final category = categories[index];
                final categoryGroups = groups.where((g) => g.categoryId == category.id).toList();
                
                return CategoryCard(
                  category: category,
                  groups: categoryGroups,
                  index: index,
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text('Error: $err')),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
