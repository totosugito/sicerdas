import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'widgets/pembukaan_app_bar.dart';
import 'widgets/pembukaan_card.dart';

class PembukaanScreen extends ConsumerStatefulWidget {
  const PembukaanScreen({super.key});

  @override
  ConsumerState<PembukaanScreen> createState() => _PembukaanScreenState();
}

class _PembukaanScreenState extends ConsumerState<PembukaanScreen> {
  late final ScrollController _scrollController;
  bool _isCollapsed = false;
  static const double _expandedHeight = 260.0;

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

    final alineaData = [
      {
        'label': 'ALINEA I',
        'text':
            'Bahwa sesungguhnya Kemerdekaan itu ialah hak segala bangsa dan oleh sebab itu, maka penjajahan di atas dunia harus dihapuskan, karena tidak sesuai dengan peri-kemanusiaan dan peri-keadilan.',
      },
      {
        'label': 'ALINEA II',
        'text':
            'Dan perjuangan pergerakan kemerdekaan Indonesia telah sampailah kepada saat yang berbahagia dengan selamat sentausa mengantarkan rakyat Indonesia ke depan pintu gerbang kemerdekaan Negara Indonesia, yang merdeka, bersatu, berdaulat, adil dan makmur.',
      },
      {
        'label': 'ALINEA III',
        'text':
            'Atas berkat rakhmat Allah Yang Maha Kuasa dan dengan didorongkan oleh keinginan luhur, supaya berkehidupan kebangsaan yang bebas, maka rakyat Indonesia menyatakan dengan ini kemerdekaannya.',
      },
      {
        'label': 'ALINEA IV',
        'text':
            'Kemudian daripada itu untuk membentuk suatu Pemerintah Negara Indonesia yang melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia dan untuk memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa, dan ikut melaksanakan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi dan keadilan sosial, maka disusunlah Kemerdekaan Kebangsaan Indonesia itu dalam suatu Undang-Undang Dasar Negara Indonesia, yang terbentuk dalam suatu susunan Negara Republik Indonesia yang berkedaulatan rakyat dengan berdasar kepada Ketuhanan Yang Maha Esa, Kemanusiaan yang adil dan beradab, Persatuan Indonesia dan Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam Permusyawaratan/Perwakilan, serta dengan mewujudkan suatu Keadilan sosial bagi seluruh rakyat Indonesia.',
      },
    ];

    return Scaffold(
      body: SelectionArea(
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // Collapsible App Bar
            PembukaanAppBar(
              isCollapsed: _isCollapsed,
              isDark: isDark,
              expandedHeight: _expandedHeight,
            ),

            // Text content inside List
            SliverPadding(
              padding: const EdgeInsets.all(16.0),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
                  final alinea = alineaData[index];
                  final label = alinea['label']!;
                  final text = alinea['text']!;

                  return PembukaanCard(label: label, text: text);
                }, childCount: alineaData.length),
              ),
            ),

            // Extra bottom spacing
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }
}
