import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'widgets/pancasila_app_bar.dart';
import 'widgets/pancasila_card.dart';

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

                return PancasilaCard(
                  id: id,
                  title: title,
                  imagePath: imagePath,
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
