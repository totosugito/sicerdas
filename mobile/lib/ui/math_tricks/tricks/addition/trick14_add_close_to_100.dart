import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick14AddCloseTo100 extends BaseTrick {
  late int op1;
  late int op2;

  Trick14AddCloseTo100(super.level);

  @override
  void generateData() {
    final int i = level;
    final double d = level.toDouble();
    op1 = ((BaseTrick.random.nextDouble() * d * 50.0).toInt()) + (i * 15);
    op2 = ((BaseTrick.random.nextDouble() * d * 30.0).toInt()) + (i * 40);

    if (op2 > op1) {
      final int temp = op1;
      op1 = op2;
      op2 = temp;
    }

    final int i5 = op2;
    if (i5 < 100) {
      op2 = ((BaseTrick.random.nextDouble() * 19.0).toInt()) + 90;
    } else if ((i5 >= 100) && (i5 < 1000)) {
      op2 =
          ((i5 ~/ 100) * 100) +
          90 +
          ((BaseTrick.random.nextDouble() * 19.0).toInt());
    } else {
      op2 =
          ((i5 ~/ 1000) * 1000) +
          ((i5 ~/ 100) * 100) +
          90 +
          ((BaseTrick.random.nextDouble() * 19.0).toInt());
    }

    answer = op1 + op2;
    questionText = '$op1 + $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);
    int temp3;
    int temp2;
    int temp1;

    String steps = "";

    if ((op2 ~/ 10) % 10 == 9) {
      temp3 = 10 - (op2 % 10);
      temp2 = op2 + temp3;
      temp1 = op1 + temp2;

      steps += createStepLabel(stepNo: 1, text: l10n.math_tricks.trick14.step1);
      steps += createStepValue(
        text:
            "${spanColor(op2, 'blue')}${plus()}${spanColor(temp3, 'green')}${equal()}${spanColor(temp2, 'yellow')}",
      );

      steps += createStepLabel(stepNo: 2, text: l10n.math_tricks.trick14.step2);
      steps += createStepValue(
        text:
            "${spanColor(temp2, 'yellow')}${plus()}${spanColor(op1, 'red')}${equal()}${spanColor(temp1, 'magenta')}",
      );

      steps += createStepLabel(stepNo: 3, text: l10n.math_tricks.trick14.step3);
      steps += createStepValue(
        text:
            "${spanColor(temp1, 'magenta')}${minus()}${spanColor(temp3, 'green')}${equal()}${spanColor(answer, 'default')}",
      );
    } else {
      temp3 = op2 % 10;
      temp2 = op2 - temp3;
      temp1 = op1 + temp2;

      steps += createStepLabel(stepNo: 1, text: l10n.math_tricks.trick14.step1);
      steps += createStepValue(
        text:
            "${spanColor(op2, 'blue')}${minus()}${spanColor(temp3, 'green')}${equal()}${spanColor(temp2, 'yellow')}",
      );

      steps += createStepLabel(stepNo: 2, text: l10n.math_tricks.trick14.step2);
      steps += createStepValue(
        text:
            "${spanColor(temp2, 'yellow')}${plus()}${spanColor(op1, 'red')}${equal()}${spanColor(temp1, 'magenta')}",
      );

      steps += createStepLabel(stepNo: 3, text: l10n.math_tricks.trick14.step3);
      steps += createStepValue(
        text:
            "${spanColor(temp1, 'magenta')}${plus()}${spanColor(temp3, 'green')}${equal()}${spanColor(answer, 'default')}",
      );
    }

    return buildHtmlContainer(
      heading: l10n.math_tricks.stepsLabel,
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 + $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 + $op2 = $answer'),
    );
  }
}
