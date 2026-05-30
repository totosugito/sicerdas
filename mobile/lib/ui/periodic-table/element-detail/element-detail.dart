import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../core/database/database.dart';
import '../../../core/providers/database_provider.dart';
import '../../../core/providers/settings_provider.dart';
import 'widgets/element_hero.dart';
import 'widgets/element_notes.dart';
import 'widgets/element_overview.dart';
import 'widgets/element_classification.dart';
import 'widgets/element_dimension.dart';
import 'widgets/element_thermal.dart';
import 'widgets/element_bulk_physical.dart';
import 'widgets/element_electrical.dart';
import 'widgets/element_magnetic.dart';
import 'widgets/element_abundances.dart';
import 'widgets/element_reactivity.dart';
import 'widgets/element_health_safety.dart';
import 'widgets/element_nuclear.dart';
import 'widgets/element_isotopes.dart';

import '../periodic-screen/widgets/element_styles.dart';
import '../models/periodic_models.dart';

class ElementDetailScreen extends ConsumerStatefulWidget {
  final PeriodicElement element;

  const ElementDetailScreen({super.key, required this.element});

  @override
  ConsumerState<ElementDetailScreen> createState() =>
      _ElementDetailScreenState();
}

class _ElementDetailScreenState extends ConsumerState<ElementDetailScreen> {
  PeriodicElementNote? _note;

  bool _hasLoadedNote = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hasLoadedNote) {
      _hasLoadedNote = true;
      _loadNote();
    }
  }

  Future<void> _loadNote() async {
    try {
      final db = ref.read(databaseProvider);
      final locale = Localizations.localeOf(context).languageCode;

      final note =
          await db.getPeriodicElementNote(
            widget.element.atomicNumber,
            locale,
          ) ??
          await db.getPeriodicElementNote(widget.element.atomicNumber, 'en');

      if (mounted) {
        setState(() {
          _note = note;
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final settings = ref.watch(settingsProvider);
    final periodicTheme = settings.periodicTheme;

    final elStyle = getElementStyle(
      widget.element.atomicGroup,
      periodicTheme,
      isDark: isDark,
    );
    final atomColor = elStyle.atomColor;

    final Map<String, dynamic> properties =
        jsonDecode(widget.element.atomicProperties) as Map<String, dynamic>? ??
        {};
    final atomicProperties = AtomicProperties.fromJson(properties);

    final Map<String, dynamic> imagesMap =
        jsonDecode(widget.element.atomicImages) as Map<String, dynamic>? ?? {};
    final atomicImages = AtomicImages.fromJson(imagesMap);

    final Map<String, dynamic> isotope =
        jsonDecode(widget.element.atomicIsotope) as Map<String, dynamic>? ?? {};

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.element.atomicName),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero card header
            ElementHero(
              element: widget.element,
              periodicTheme: periodicTheme,
              isDark: isDark,
            ),
            const SizedBox(height: 24),

            // Accordion sections
            ShadAccordion<String>(
              children: [
                ElementOverview(
                  properties: atomicProperties,
                  images: atomicImages,
                  atomColor: atomColor,
                  atomSymbol: widget.element.atomicSymbol,
                ),
                ElementNotes(note: _note),
                ElementClassification(properties: atomicProperties),
                ElementDimension(properties: atomicProperties),
                ElementThermal(properties: atomicProperties),
                ElementBulkPhysical(properties: atomicProperties),
                ElementElectrical(properties: atomicProperties),
                ElementMagnetic(properties: atomicProperties),
                ElementAbundances(properties: atomicProperties),
                ElementReactivity(properties: properties),
                ElementHealthSafety(properties: properties),
                ElementNuclear(properties: properties),
                ElementIsotopes(isotope: isotope),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
