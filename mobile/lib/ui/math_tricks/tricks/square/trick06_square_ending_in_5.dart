import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick06SquareEndingIn5 extends BaseTrick {
  late int op1;
  late int op2;

  Trick06SquareEndingIn5(super.level);

  @override
  void generateData() {
    final int i = level;
    int temp = ((BaseTrick.random.nextDouble() * 9.0).toInt()) + i;
    op1 = (temp * 10) + 5;
    op2 = 2;
    answer = op1 * op1;

    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 25;
    op2 = 2;
    answer = op1 * op1;
    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    final int temp1 = op1 ~/ 10;
    final int temp3 = temp1 * (temp1 + 1);

    String steps = "";

    // Step 1: Multiply temp1 by temp1 + 1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick06.step1(temp1: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'blue')}${times()}(${spanColor(temp1, 'blue')}${plus()}1)${equal()}${spanColor(temp3, 'magenta')}",
    );

    // Step 2: Append 25
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick06.step2,
    );
    steps += createStepValue(
      text:
          "${spanColor(temp3, 'magenta')}_${spanColor('25', 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1²',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1² = $answer'),
    );
  }
}
