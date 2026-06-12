import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'widgets/pembukaan_app_bar.dart';

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

    final cardGradients = [
      [const Color(0xFFFFF5F5), const Color(0xFFFFFFFF)],
      [const Color(0xFFFFFFFF), const Color(0xFFFFF5F5)],
      [const Color(0xFFFFF5F5), const Color(0xFFFFFFFF)],
      [const Color(0xFFFFFFFF), const Color(0xFFFFF5F5)],
    ];

    final darkCardGradients = [
      [const Color(0xFF1E1B1B), const Color(0xFF151313)],
      [const Color(0xFF151313), const Color(0xFF1E1B1B)],
      [const Color(0xFF1E1B1B), const Color(0xFF151313)],
      [const Color(0xFF151313), const Color(0xFF1E1B1B)],
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
                  final gradient = isDark
                      ? darkCardGradients[index]
                      : cardGradients[index];

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16.0),
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
                                label,
                                style: const TextStyle(
                                  color: Color(0xFFEF4444),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              text,
                              style: theme.textTheme.muted.copyWith(
                                fontSize: 15,
                                height: 1.6,
                                color: isDark
                                    ? Colors.white.withValues(alpha: 0.9)
                                    : const Color(0xFF2D3748),
                                fontWeight: FontWeight.normal,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
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
