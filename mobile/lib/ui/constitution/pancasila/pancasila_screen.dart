import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import 'widgets/pancasila_app_bar.dart';

class PancasilaScreen extends ConsumerStatefulWidget {
  const PancasilaScreen({super.key});

  @override
  ConsumerState<PancasilaScreen> createState() => _PancasilaScreenState();
}

class _PancasilaScreenState extends ConsumerState<PancasilaScreen> {
  late final ScrollController _scrollController;
  bool _isCollapsed = false;
  static const double _expandedHeight = 220.0;

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
          (_expandedHeight -
              kToolbarHeight -
              MediaQuery.of(context).padding.top -
              16);
      if (isCollapsed != _isCollapsed) {
        setState(() {
          _isCollapsed = isCollapsed;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final isDark = theme.brightness == Brightness.dark;

    final pancasilaData = [
      {
        'id': 1,
        'title': 'Ketuhanan Yang Maha Esa',
        'image': 'assets/constitution/images/sila_1.png',
      },
      {
        'id': 2,
        'title': 'Kemanusiaan yang adil dan beradab',
        'image': 'assets/constitution/images/sila_2.png',
      },
      {
        'id': 3,
        'title': 'Persatuan Indonesia',
        'image': 'assets/constitution/images/sila_3.png',
      },
      {
        'id': 4,
        'title':
            'Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan',
        'image': 'assets/constitution/images/sila_4.png',
      },
      {
        'id': 5,
        'title': 'Keadilan sosial bagi seluruh rakyat Indonesia',
        'image': 'assets/constitution/images/sila_5.png',
      },
    ];

    // Colorful gradient cards matching the React web implementation
    final cardGradients = [
      [
        const Color(0xFFFFF5F5),
        const Color(0xFFFFFFFF),
      ], // Sila 1 (reddish hint)
      [const Color(0xFFFFFFFF), const Color(0xFFFFF5F5)], // Sila 2
      [const Color(0xFFFFF5F5), const Color(0xFFFFFFFF)], // Sila 3
      [const Color(0xFFFFFFFF), const Color(0xFFFFF5F5)], // Sila 4
      [const Color(0xFFFFF5F5), const Color(0xFFFFFFFF)], // Sila 5
    ];

    final darkCardGradients = [
      [const Color(0xFF1E1B1B), const Color(0xFF151313)],
      [const Color(0xFF151313), const Color(0xFF1E1B1B)],
      [const Color(0xFF1E1B1B), const Color(0xFF151313)],
      [const Color(0xFF151313), const Color(0xFF1E1B1B)],
      [const Color(0xFF1E1B1B), const Color(0xFF151313)],
    ];

    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // Pinned Collapsible App Bar
          PancasilaAppBar(
            isCollapsed: _isCollapsed,
            isDark: isDark,
            expandedHeight: _expandedHeight,
          ),

          // Scrollable list content
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate((context, index) {
                final sila = pancasilaData[index];
                final id = sila['id'] as int;
                final title = sila['title'] as String;
                final imagePath = sila['image'] as String;

                final gradient = isDark
                    ? darkCardGradients[index]
                    : cardGradients[index];

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: LinearGradient(
                        colors: gradient,
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(
                            alpha: isDark ? 0.3 : 0.04,
                          ),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                      border: Border.all(
                        color: Colors.red.withValues(
                          alpha: isDark ? 0.15 : 0.08,
                        ),
                        width: 1.5,
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Sila Icon Image
                          Hero(
                            tag: 'sila_icon_$id',
                            child: Image.asset(
                              imagePath,
                              width: 48,
                              height: 48,
                              fit: BoxFit.contain,
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Sila Content
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.red.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '${l10n.constitutionSila} $id',
                                    style: const TextStyle(
                                      color: Color(0xFFEF4444),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  title,
                                  style: theme.textTheme.large.copyWith(
                                    fontSize: 16,
                                    fontWeight: FontWeight.normal,
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }, childCount: pancasilaData.length),
            ),
          ),
          // Extra bottom padding
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}
