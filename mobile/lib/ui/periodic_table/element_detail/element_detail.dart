import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:path_provider/path_provider.dart';
import 'package:bse/core/database/database.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/ui/periodic_table/libs/providers/periodic_provider.dart';
import 'widgets/detail_app_bar.dart';
import 'widgets/navigation_bar.dart';
import 'widgets/electron_view.dart';
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

import '../libs/providers/periodic_sync_provider.dart';
import '../periodic_screen/widgets/element_styles.dart';
import '../libs/models/periodic_models.dart';
import '../libs/utils/periodic_utils.dart';

class ElementDetailScreen extends ConsumerStatefulWidget {
  final PeriodicElement element;
  final PeriodicElement? previous;
  final PeriodicElement? next;
  final List<String>? initialExpandedKeys;

  const ElementDetailScreen({
    super.key,
    required this.element,
    this.previous,
    this.next,
    this.initialExpandedKeys,
  });

  @override
  ConsumerState<ElementDetailScreen> createState() =>
      _ElementDetailScreenState();
}

class _ElementDetailScreenState extends ConsumerState<ElementDetailScreen> {
  PeriodicElementNote? _note;
  String? _imagePath;
  String? _spectrumPath;
  late final ScrollController _scrollController;
  late final ShadAccordionController<String> _accordionController;
  bool _isCollapsed = false;

  bool _hasLoadedNote = false;

  static const _accordionKeys = [
    'group_overview',
    'group_notes',
    'group_classification',
    'group_dimension',
    'group_thermal',
    'group_bulk_physical',
    'group_electrical',
    'group_magnetic',
    'group_abundances',
    'group_reactivity',
    'group_health_safety',
    'group_nuclear',
  ];

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_scrollListener);
    _accordionController = ShadAccordionController<String>.multiple(
      widget.initialExpandedKeys ?? [],
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _accordionController.dispose();
    super.dispose();
  }

  void _scrollListener() {
    if (_scrollController.hasClients) {
      final isCollapsed =
          _scrollController.offset >
          (340.0 - kToolbarHeight - MediaQuery.of(context).padding.top - 20);
      if (isCollapsed != _isCollapsed) {
        setState(() {
          _isCollapsed = isCollapsed;
        });
      }
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hasLoadedNote) {
      _hasLoadedNote = true;
      _loadNote();
      _loadImage();
    }
  }

  Future<void> _loadImage() async {
    try {
      final dataDir = await getExternalStorageDirectory();
      if (dataDir != null) {
        final path = PeriodicUtils.getAtomImagePath(
          dataDir.path,
          widget.element.atomicNumber,
        );
        final imageFile = File(path);
        if (await imageFile.exists() && mounted) {
          setState(() {
            _imagePath = imageFile.path;
          });
        }

        final spectrumPath = PeriodicUtils.getSpectrumImagePath(
          dataDir.path,
          widget.element.atomicNumber,
        );
        final spectrumFile = File(spectrumPath);
        if (await spectrumFile.exists() && mounted) {
          setState(() {
            _spectrumPath = spectrumFile.path;
          });
        }
      }
    } catch (_) {}
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

    final periodicTheme = ref.watch(periodicThemeProvider);

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

    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          ValueListenableBuilder<List<String>>(
            valueListenable: _accordionController,
            builder: (context, expandedItems, _) {
              final isAllExpanded =
                  expandedItems.length == _accordionKeys.length;
              return DetailAppBar(
                element: widget.element,
                atomicProperties: atomicProperties,
                elStyle: elStyle,
                atomColor: atomColor,
                imagePath: _imagePath,
                isCollapsed: _isCollapsed,
                isDark: isDark,
                isAllExpanded: isAllExpanded,
                onToggleExpandCollapse: () {
                  if (isAllExpanded) {
                    _accordionController.value = const [];
                  } else {
                    _accordionController.value = _accordionKeys;
                  }
                },
              );
            },
          ),
          ElementNavBar(
            previous: widget.previous,
            next: widget.next,
            elStyle: elStyle,
            periodicTheme: periodicTheme,
            isDark: isDark,
            onNavigate: (target) {
              final byNumber = {
                for (final e in ref.read(periodicSyncProvider).elements)
                  e.atomicNumber: e,
              };
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (_) => ElementDetailScreen(
                    element: target,
                    previous: byNumber[target.atomicNumber - 1],
                    next: byNumber[target.atomicNumber + 1],
                    initialExpandedKeys: _accordionController.value,
                  ),
                ),
              );
            },
          ),
          SliverToBoxAdapter(
            child: ElectronView(
              properties: atomicProperties,
              atomicNumber: widget.element.atomicNumber,
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                ShadAccordion<String>.multiple(
                  controller: _accordionController,
                  children: [
                    ElementOverview(
                      properties: atomicProperties,
                      images: atomicImages,
                      atomColor: atomColor,
                      atomSymbol: widget.element.atomicSymbol,
                      spectrumPath: _spectrumPath,
                    ),
                    ElementNotes(note: _note),
                    ElementClassification(properties: atomicProperties),
                    ElementDimension(properties: atomicProperties),
                    ElementThermal(properties: atomicProperties),
                    ElementBulkPhysical(properties: atomicProperties),
                    ElementElectrical(properties: atomicProperties),
                    ElementMagnetic(properties: atomicProperties),
                    ElementAbundances(properties: atomicProperties),
                    ElementReactivity(properties: atomicProperties),
                    ElementHealthSafety(properties: atomicProperties),
                    ElementNuclear(properties: atomicProperties),
                  ],
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}
