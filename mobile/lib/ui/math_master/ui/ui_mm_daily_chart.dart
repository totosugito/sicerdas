import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:syncfusion_flutter_charts/charts.dart';
import '../libs/providers/math_master_repository.dart';

class UiMmDailyChart extends ConsumerStatefulWidget {
  const UiMmDailyChart({super.key});

  static void navigate(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const UiMmDailyChart()),
    );
  }

  @override
  ConsumerState<UiMmDailyChart> createState() => _UiMmDailyChartState();
}

class _ChartData {
  final String dateStr;
  final int correct;
  final int wrong;

  _ChartData({
    required this.dateStr,
    required this.correct,
    required this.wrong,
  });
}

class _UiMmDailyChartState extends ConsumerState<UiMmDailyChart> {
  List<_ChartData> chartData = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadChartData();
  }

  Future<void> _loadChartData() async {
    final repo = ref.read(mathMasterRepositoryProvider);
    final scores = await repo.getRecentScores(limit: 100);

    if (!mounted) return;

    // Group scores by date (yyyy-MM-dd)
    final Map<String, Map<String, int>> grouped = {};
    final dateFormat = DateFormat('dd/MM');

    for (final score in scores) {
      final dateStr = dateFormat.format(score.completedAt);
      if (!grouped.containsKey(dateStr)) {
        grouped[dateStr] = {'correct': 0, 'wrong': 0};
      }
      grouped[dateStr]!['correct'] =
          grouped[dateStr]!['correct']! + score.correctCount;
      grouped[dateStr]!['wrong'] =
          grouped[dateStr]!['wrong']! + score.wrongCount;
    }

    // Convert to list sorted chronologically
    final List<_ChartData> dataList = [];
    grouped.forEach((key, val) {
      dataList.add(
        _ChartData(
          dateStr: key,
          correct: val['correct'] ?? 0,
          wrong: val['wrong'] ?? 0,
        ),
      );
    });

    // reverse to show chronologically from left to right (oldest to newest)
    final sortedData = dataList.reversed.toList();

    setState(() {
      chartData = sortedData;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Progres Harian'), centerTitle: true),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Analisis Latihan',
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Menampilkan performa menjawab dalam beberapa hari terakhir.',
                    style: theme.textTheme.muted,
                  ),
                  const SizedBox(height: 24),
                  if (chartData.isEmpty)
                    Expanded(
                      child: Center(
                        child: Text(
                          'Belum ada riwayat latihan untuk ditampilkan.',
                          style: theme.textTheme.muted,
                        ),
                      ),
                    )
                  else
                    Expanded(
                      child: ShadCard(
                        padding: const EdgeInsets.all(16),
                        child: SfCartesianChart(
                          plotAreaBorderWidth: 0,
                          margin: EdgeInsets.zero,
                          primaryXAxis: const CategoryAxis(
                            majorGridLines: MajorGridLines(width: 0),
                            labelStyle: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          primaryYAxis: const NumericAxis(
                            axisLine: AxisLine(width: 0),
                            majorTickLines: MajorTickLines(size: 0),
                            labelStyle: TextStyle(fontSize: 10),
                          ),
                          legend: const Legend(
                            isVisible: true,
                            position: LegendPosition.bottom,
                            textStyle: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          tooltipBehavior: TooltipBehavior(enable: true),
                          series: <CartesianSeries<_ChartData, String>>[
                            StackedColumnSeries<_ChartData, String>(
                              dataSource: chartData,
                              xValueMapper: (_ChartData data, _) =>
                                  data.dateStr,
                              yValueMapper: (_ChartData data, _) =>
                                  data.correct,
                              name: 'Benar',
                              color: Colors.green.shade400,
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(4),
                                topRight: Radius.circular(4),
                              ),
                            ),
                            StackedColumnSeries<_ChartData, String>(
                              dataSource: chartData,
                              xValueMapper: (_ChartData data, _) =>
                                  data.dateStr,
                              yValueMapper: (_ChartData data, _) => data.wrong,
                              name: 'Salah',
                              color: Colors.red.shade400,
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(4),
                                topRight: Radius.circular(4),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}
