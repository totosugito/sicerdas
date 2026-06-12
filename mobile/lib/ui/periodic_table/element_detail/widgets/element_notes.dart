import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/database/database.dart';
import 'package:bse/i18n/strings.g.dart';
import 'property_item_html.dart';

class ElementNotes extends StatelessWidget {
  final PeriodicElementNote? note;

  const ElementNotes({super.key, required this.note});

  @override
  Widget build(BuildContext context) {
    if (note == null) {
      return const SizedBox.shrink() as dynamic;
    }

    final l10n = Translations.of(context);

    final hasContent =
        note!.atomicOverview.isNotEmpty ||
        note!.atomicHistory.isNotEmpty ||
        note!.atomicApps.isNotEmpty ||
        note!.atomicFacts.isNotEmpty;

    if (!hasContent) {
      return const SizedBox.shrink() as dynamic;
    }

    return ShadAccordionItem<String>(
      value: 'notes',
      title: Row(
        children: [
          const Icon(LucideIcons.fileText, size: 18),
          const SizedBox(width: 8),
          Text(l10n.periodic_table.periodicNotes),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (note!.atomicOverview.isNotEmpty)
              PropertyItemHtml(
                label: l10n.periodic_table.sections.overview,
                value: note!.atomicOverview,
              ),
            if (note!.atomicHistory.isNotEmpty)
              PropertyItemHtml(
                label: l10n.periodic_table.sections.history,
                value: note!.atomicHistory,
              ),
            if (note!.atomicApps.isNotEmpty)
              PropertyItemHtml(
                label: l10n.periodic_table.sections.applications,
                value: note!.atomicApps,
              ),
            if (note!.atomicFacts.isNotEmpty)
              PropertyItemHtml(
                label: l10n.periodic_table.sections.interestingFacts,
                value: note!.atomicFacts,
              ),
          ],
        ),
      ),
    );
  }
}
