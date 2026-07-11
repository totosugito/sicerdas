import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:syncfusion_flutter_charts/charts.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../../../core/database/database.dart';

enum ChartPeriod { daily, weekly, monthly }

class ChartDataPoint {
  final String label;
  final int correct;
  final int wrong;
  final DateTime date;

  ChartDataPoint({
    required this.label,
    required this.correct,
    required this.wrong,
    required this.date,
  });
}

class AchievementProgressChart extends StatefulWidget {
  final List<MathMasterScore> scores;

  const AchievementProgressChart({super.key, required this.scores});

  @override
  State<AchievementProgressChart> createState() =>
      _AchievementProgressChartState();
}

class _AchievementProgressChartState extends State<AchievementProgressChart> {
  ChartPeriod _selectedPeriod = ChartPeriod.daily;
  DateTimeRange? _selectedDateRange;

  // Helper to normalize DateTime to start of day
  DateTime _startOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day);
  }

  // Helper to normalize DateTime to end of day
  DateTime _endOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day, 23, 59, 59, 999);
  }

  // Get start of week (Monday)
  DateTime _startOfWeek(DateTime date) {
    return _startOfDay(date.subtract(Duration(days: date.weekday - 1)));
  }

  // Get start of month (1st day)
  DateTime _startOfMonth(DateTime date) {
    return DateTime(date.year, date.month, 1);
  }

  List<ChartDataPoint> _generateChartData() {
    final baseDate = widget.scores.isNotEmpty
        ? widget.scores.first.completedAt
        : DateTime.now();
    DateTime start;
    DateTime end;

    if (_selectedDateRange != null) {
      start = _startOfDay(_selectedDateRange!.start);
      end = _endOfDay(_selectedDateRange!.end);
    } else {
      switch (_selectedPeriod) {
        case ChartPeriod.daily:
          start = _startOfDay(baseDate.subtract(const Duration(days: 6)));
          end = _endOfDay(baseDate);
          break;
        case ChartPeriod.weekly:
          start = _startOfWeek(
            baseDate.subtract(const Duration(days: 35)),
          ); // 6 weeks total
          end = _endOfDay(baseDate);
          break;
        case ChartPeriod.monthly:
          start = _startOfMonth(
            baseDate.subtract(const Duration(days: 150)),
          ); // ~6 months
          end = _endOfDay(baseDate);
          break;
      }
    }

    // Filter scores within date range
    final filteredScores = widget.scores.where((score) {
      return score.completedAt.isAfter(
            start.subtract(const Duration(milliseconds: 1)),
          ) &&
          score.completedAt.isBefore(end.add(const Duration(milliseconds: 1)));
    }).toList();

    final List<ChartDataPoint> points = [];

    if (_selectedPeriod == ChartPeriod.daily) {
      final daysDiff = end.difference(start).inDays;
      for (int i = 0; i <= daysDiff; i++) {
        final current = start.add(Duration(days: i));
        final nextDay = current.add(const Duration(days: 1));

        final intervalScores = filteredScores.where((score) {
          return score.completedAt.isAfter(
                current.subtract(const Duration(milliseconds: 1)),
              ) &&
              score.completedAt.isBefore(nextDay);
        });

        int correct = 0;
        int wrong = 0;
        for (final score in intervalScores) {
          correct += score.correctCount;
          wrong += score.wrongCount;
        }

        points.add(
          ChartDataPoint(
            label: DateFormat('dd/MM').format(current),
            correct: correct,
            wrong: wrong,
            date: current,
          ),
        );
      }
    } else if (_selectedPeriod == ChartPeriod.weekly) {
      DateTime current = _startOfWeek(start);
      final actualEnd = _endOfDay(end);

      while (current.isBefore(actualEnd)) {
        final nextWeek = current.add(const Duration(days: 7));
        final intervalScores = filteredScores.where((score) {
          return score.completedAt.isAfter(
                current.subtract(const Duration(milliseconds: 1)),
              ) &&
              score.completedAt.isBefore(nextWeek);
        });

        int correct = 0;
        int wrong = 0;
        for (final score in intervalScores) {
          correct += score.correctCount;
          wrong += score.wrongCount;
        }

        points.add(
          ChartDataPoint(
            label: DateFormat('dd/MM').format(current),
            correct: correct,
            wrong: wrong,
            date: current,
          ),
        );

        current = nextWeek;
      }
    } else {
      // Monthly
      DateTime current = _startOfMonth(start);
      final actualEnd = _endOfDay(end);

      while (current.isBefore(actualEnd)) {
        // Go to next month
        final nextMonth = DateTime(current.year, current.month + 1, 1);
        final intervalScores = filteredScores.where((score) {
          return score.completedAt.isAfter(
                current.subtract(const Duration(milliseconds: 1)),
              ) &&
              score.completedAt.isBefore(nextMonth);
        });

        int correct = 0;
        int wrong = 0;
        for (final score in intervalScores) {
          correct += score.correctCount;
          wrong += score.wrongCount;
        }

        points.add(
          ChartDataPoint(
            label: DateFormat('MM/yy').format(current),
            correct: correct,
            wrong: wrong,
            date: current,
          ),
        );

        current = nextMonth;
      }
    }

    return points;
  }

  Future<void> _pickDateRange(BuildContext context) async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      initialDateRange: _selectedDateRange,
    );

    if (picked != null) {
      setState(() {
        _selectedDateRange = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final locale = Translations.of(context).math_master;
    final dataPoints = _generateChartData();

    final dateRangeLabel = _selectedDateRange == null
        ? locale.select_date_range
        : '${DateFormat('dd/MM/yy').format(_selectedDateRange!.start)} - ${DateFormat('dd/MM/yy').format(_selectedDateRange!.end)}';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Header Row
        Row(
          children: [
            Container(
              width: 4,
              height: 18,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              locale.daily_progress,
              style: theme.textTheme.large.copyWith(
                fontWeight: FontWeight.w800,
                fontSize: 16,
                letterSpacing: -0.3,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(locale.practice_analysis_desc, style: theme.textTheme.muted),
        const SizedBox(height: 16),

        // Period Selection Tabs & Date Range Button
        Wrap(
          alignment: WrapAlignment.spaceBetween,
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 12,
          runSpacing: 10,
          children: [
            // Period Toggle Buttons
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: theme.colorScheme.muted.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: ChartPeriod.values.map((period) {
                  final isSelected = _selectedPeriod == period;
                  String text = '';
                  switch (period) {
                    case ChartPeriod.daily:
                      text = locale.daily;
                      break;
                    case ChartPeriod.weekly:
                      text = locale.weekly;
                      break;
                    case ChartPeriod.monthly:
                      text = locale.monthly;
                      break;
                  }

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedPeriod = period;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? theme.colorScheme.card
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(6),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.05),
                                  blurRadius: 4,
                                  offset: const Offset(0, 1),
                                ),
                              ]
                            : null,
                      ),
                      child: Text(
                        text,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.normal,
                          color: isSelected
                              ? theme.colorScheme.foreground
                              : theme.colorScheme.mutedForeground,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            // Date Filter Trigger Button
            GestureDetector(
              onTap: () => _pickDateRange(context),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  border: Border.all(color: theme.colorScheme.border),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.calendar_today_rounded,
                      size: 14,
                      color: theme.colorScheme.mutedForeground,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      dateRangeLabel,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: _selectedDateRange != null
                            ? FontWeight.bold
                            : FontWeight.normal,
                      ),
                    ),
                    if (_selectedDateRange != null) ...[
                      const SizedBox(width: 6),
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedDateRange = null;
                          });
                        },
                        child: Icon(
                          Icons.clear_rounded,
                          size: 14,
                          color: theme.colorScheme.mutedForeground,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // SfCartesianChart Widget Container
        if (dataPoints.every((p) => p.correct == 0 && p.wrong == 0))
          Container(
            height: 220,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              border: Border.all(
                color: theme.colorScheme.border.withValues(alpha: 0.5),
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(locale.no_chart_data, style: theme.textTheme.muted),
          )
        else
          SizedBox(
            height: 220,
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
                legend: Legend(
                  isVisible: true,
                  position: LegendPosition.bottom,
                  textStyle: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                tooltipBehavior: TooltipBehavior(enable: true),
                series: <CartesianSeries<ChartDataPoint, String>>[
                  StackedColumnSeries<ChartDataPoint, String>(
                    dataSource: dataPoints,
                    xValueMapper: (ChartDataPoint data, _) => data.label,
                    yValueMapper: (ChartDataPoint data, _) => data.correct,
                    name: locale.correct,
                    color: Colors.green.shade400,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(4),
                      topRight: Radius.circular(4),
                    ),
                  ),
                  StackedColumnSeries<ChartDataPoint, String>(
                    dataSource: dataPoints,
                    xValueMapper: (ChartDataPoint data, _) => data.label,
                    yValueMapper: (ChartDataPoint data, _) => data.wrong,
                    name: locale.wrong,
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
    );
  }
}
