import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick50Percent25 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick50Percent25(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    switch (chapterKey) {
      case 'trick50Percent25':
        ans = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10) + 1;
        op2 = ans * 4;
        op1 = 25;
        break;
      case 'trick49Percent50':
        ans = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10) + 1;
        op2 = ans * 2;
        op1 = 50;
        break;
      default:
        ans = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10) + 1;
        op2 = ans * 4;
        op1 = 25;
    }

    answer = ans;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick50Percent25':
        op1 = 25;
        op2 = 100;
        break;
      case 'trick49Percent50':
        op1 = 50;
        op2 = 100;
        break;
      default:
        op1 = 25;
        op2 = 100;
    }
    answer = (op1 * op2) ~/ 100;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int divisor = 4;
    switch (chapterKey) {
      case 'trick50Percent25':
        divisor = 4;
        break;
      case 'trick49Percent50':
        divisor = 2;
        break;
      default:
        divisor = 4;
    }

    String steps = "";

    // Step 1: Explain that op1% = 100% / divisor
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick50.step1(
        op1: op1.toString(),
        divisor: divisor.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor('$op1%', 'red')}${equal()}100%${divide()}${spanColor(divisor, 'yellow')}",
    );

    // Step 2: Divide op2 by divisor
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick50.step2(
        divisor: divisor.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op2, 'blue')}${divide()}${spanColor(divisor, 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1% ${l10n.math_tricks.of} $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1% ${l10n.math_tricks.of} $op2 = $answer'),
    );
  }
}
