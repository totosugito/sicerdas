import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:syncfusion_flutter_charts/charts.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../../../core/database/database.dart';

class DailyTrendChart extends StatelessWidget {
  final List<MathTrickDailyScore> scores;

  const DailyTrendChart({super.key, required this.scores});

  String _formatDateSimple(int dateId) {
    final month = (dateId % 10000) ~/ 100;
    final day = dateId % 100;
    return '$day/$month';
  }

  String _formatDateFull(int dateId) {
    final year = dateId ~/ 10000;
    final month = (dateId % 10000) ~/ 100;
    final day = dateId % 100;
    return '$day/$month/$year';
  }

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);
    final reversedScores = scores.reversed.toList();

    return ShadCard(
      padding: const EdgeInsets.only(top: 16, right: 16, bottom: 8, left: 16),
      radius: BorderRadius.circular(16),
      child: SizedBox(
        height: 220,
        child: SfCartesianChart(
          plotAreaBorderWidth: 0,
          margin: EdgeInsets.zero,
          primaryXAxis: const CategoryAxis(
            majorGridLines: MajorGridLines(width: 0),
            labelStyle: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
          ),
          primaryYAxis: const NumericAxis(
            axisLine: AxisLine(width: 0),
            majorTickLines: MajorTickLines(size: 0),
            labelStyle: TextStyle(fontSize: 10),
          ),
          legend: const Legend(
            isVisible: true,
            position: LegendPosition.bottom,
            textStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
          ),
          tooltipBehavior: TooltipBehavior(enable: true),
          onTooltipRender: (TooltipArgs args) {
            final index = args.pointIndex?.toInt();
            if (index != null && index >= 0 && index < reversedScores.length) {
              final score = reversedScores[index];
              args.header = _formatDateFull(score.dateId);

              final isCorrectSeries = args.seriesIndex == 0;
              final name = isCorrectSeries
                  ? l10n.math_tricks.achievement.correct
                  : l10n.math_tricks.achievement.wrong;
              final value = isCorrectSeries
                  ? score.correctAnswer
                  : score.wrongAnswer;
              args.text = '$name: $value';
            }
          },
          series: <CartesianSeries<MathTrickDailyScore, String>>[
            StackedColumnSeries<MathTrickDailyScore, String>(
              dataSource: reversedScores,
              xValueMapper: (MathTrickDailyScore score, _) =>
                  _formatDateSimple(score.dateId),
              yValueMapper: (MathTrickDailyScore score, _) =>
                  score.correctAnswer,
              name: l10n.math_tricks.achievement.correct,
              color: Colors.green.shade400,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(4),
                topRight: Radius.circular(4),
              ),
            ),
            StackedColumnSeries<MathTrickDailyScore, String>(
              dataSource: reversedScores,
              xValueMapper: (MathTrickDailyScore score, _) =>
                  _formatDateSimple(score.dateId),
              yValueMapper: (MathTrickDailyScore score, _) => score.wrongAnswer,
              name: l10n.math_tricks.achievement.wrong,
              color: Colors.red.shade400,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(4),
                topRight: Radius.circular(4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
