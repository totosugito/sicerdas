import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick57Percent150 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick57Percent150(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = ((BaseTrick.random.nextDouble() * 15.0).toInt()) + ((i - 1) * 10);
    ans += 1;
    ans *= 2;
    op2 = ans;
    ans += ans ~/ 2;
    op1 = 150;

    answer = ans;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 150;
    op2 = 10;
    answer = (op1 * op2) ~/ 100;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    final int temp1 = op2 ~/ 2;

    String steps = "";

    // Step 1: Divide op2 by 2 to get 50%
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick57.step1,
    );
    steps += createStepValue(
      text:
          "${spanColor(op2, 'blue')}${divide()}2${equal()}${spanColor(temp1, 'yellow')}",
    );

    // Step 2: Add 50% to original number
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick57.step2(
        temp1: temp1.toString(),
        op2: op2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op2, 'blue')}${plus()}${spanColor(temp1, 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1% ${l10n.math_tricks.of} $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1% ${l10n.math_tricks.of} $op2 = $answer'),
    );
  }
}
