import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick52Percent15 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick52Percent15(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10) + 1;
    ans *= 20;
    op2 = ans;
    op1 = 15;
    answer = (ans ~/ 10) + (ans ~/ 20);
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 15;
    op2 = 240;
    answer = (op1 * op2) ~/ 100;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    const int divisor1 = 10;
    const int divisor2 = 2;

    final int temp1 = op2 ~/ divisor1;
    final int temp2 = temp1 ~/ divisor2;

    String steps = "";

    // Step 1: Divide op2 by 10 to get 10%
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick52.step1(
        divisor1: divisor1.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op2, 'blue')}${divide()}${spanColor(divisor1, 'green')}${equal()}${spanColor(temp1, 'yellow')}",
    );

    // Step 2: Divide Step 1 result by 2 to get 5%
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick52.step2(
        temp1: temp1.toString(),
        divisor2: divisor2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'yellow')}${divide()}${spanColor(divisor2, 'magenta')}${equal()}${spanColor(temp2, 'blue')}",
    );

    // Step 3: Add Step 1 and Step 2 results
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick52.step3(
        temp1: temp1.toString(),
        temp2: temp2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'yellow')}${plus()}${spanColor(temp2, 'blue')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1% ${l10n.math_tricks.of} $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1% ${l10n.math_tricks.of} $op2 = $answer'),
    );
  }
}
