import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:path_provider/path_provider.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';
import '../../../core/database/database.dart';
import '../../../core/providers/database_provider.dart';
import '../../../core/providers/settings_provider.dart';
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

import '../periodic_screen/widgets/element_styles.dart';
import '../libs/models/periodic_models.dart';
import '../libs/utils/periodic_utils.dart';

class ElementDetailScreen extends ConsumerStatefulWidget {
  final PeriodicElement element;

  const ElementDetailScreen({super.key, required this.element});

  @override
  ConsumerState<ElementDetailScreen> createState() =>
      _ElementDetailScreenState();
}

class _ElementDetailScreenState extends ConsumerState<ElementDetailScreen> {
  PeriodicElementNote? _note;
  String? _imagePath;
  late final ScrollController _scrollController;
  bool _isCollapsed = false;

  bool _hasLoadedNote = false;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_scrollListener);
  }

  @override
  void dispose() {
    _scrollController.dispose();
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
    final l10n = AppLocalizations.of(context)!;

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

    final appBarColor = _isCollapsed
        ? (isDark ? Colors.white : Colors.black87)
        : Colors.white;

    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          SliverAppBar(
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
                onPressed: () {},
              ),
              IconButton(
                icon: Icon(LucideIcons.atom, color: appBarColor),
                onPressed: () {},
              ),
              IconButton(
                icon: Icon(LucideIcons.chevronUp, color: appBarColor),
                onPressed: () {},
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: false,
              titlePadding: const EdgeInsets.only(left: 56, bottom: 16),
              title: AnimatedOpacity(
                duration: const Duration(milliseconds: 150),
                opacity: _isCollapsed ? 1.0 : 0.0,
                child: Text(
                  "${widget.element.atomicName} [${widget.element.atomicSymbol}]",
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
                  if (_imagePath != null)
                    Image.file(File(_imagePath!), fit: BoxFit.cover)
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
                        color: elStyle.gradient == null
                            ? elStyle.background
                            : null,
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
                  // Overlay elements matching screenshot (bottom left)
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
                          decoration: BoxDecoration(
                            color: atomColor, // Group color
                          ),
                          child: Text(
                            "${widget.element.atomicNumber}  |  ${PeriodicUtils.getLocalizedSeries(l10n, widget.element.atomicGroup)}",
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        // H Symbol, Hydrogen Name, and Atomic Weight
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              widget.element.atomicSymbol,
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
                                  widget.element.atomicName,
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
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
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
