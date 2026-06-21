import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick15SubtractionCloseTo100 extends BaseTrick {
  late int op1;
  late int op2;

  Trick15SubtractionCloseTo100(super.level);

  @override
  void generateData() {
    final int i = level;
    final double d = level.toDouble();
    
    int tempOp1 = ((BaseTrick.random.nextDouble() * d * 10.0).toInt()) + (i * 15);
    int tempOp2 = ((BaseTrick.random.nextDouble() * d * 5.0).toInt()) + (i * 15);
    
    if (tempOp2 > tempOp1) {
      final int temp = tempOp1;
      tempOp1 = tempOp2;
      tempOp2 = temp;
    }
    
    final int temp = tempOp2;
    op1 = tempOp1 + 109;
    
    if (temp >= 100) {
      op2 = ((temp / 100 * 100) + 90).toInt() + (BaseTrick.random.nextDouble() * 19.0).toInt();
    } else if (temp >= 1000) {
      op2 = (((temp / 1000 * 1000) + (temp / 100 * 100)).toInt() + 90) + (BaseTrick.random.nextDouble() * 19.0).toInt();
    } else {
      op2 = (BaseTrick.random.nextDouble() * 19.0).toInt() + 90;
    }

    answer = op1 - op2;
    questionText = '$op1 - $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 125;
    op2 = 98;
    answer = op1 - op2;
    questionText = '$op1 - $op2';
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
      temp1 = op1 - temp2;

      steps += createStepLabel(
        stepNo: 1,
        text: l10n.math_tricks.trick15.step1RoundUp(
          op2: op2.toString(),
          temp2: temp2.toString(),
          temp3: temp3.toString(),
        ),
      );
      steps += createStepValue(
        text:
            "${spanColor(op2, 'blue')}${plus()}${spanColor(temp3, 'green')}${equal()}${spanColor(temp2, 'yellow')}",
      );

      steps += createStepLabel(
        stepNo: 2,
        text: l10n.math_tricks.trick15.step2(
          temp2: temp2.toString(),
          op1: op1.toString(),
        ),
      );
      steps += createStepValue(
        text:
            "${spanColor(op1, 'red')}${minus()}${spanColor(temp2, 'yellow')}${equal()}${spanColor(temp1, 'magenta')}",
      );

      steps += createStepLabel(
        stepNo: 3,
        text: l10n.math_tricks.trick15.step3RoundUp(temp3: temp3.toString()),
      );
      steps += createStepValue(
        text:
            "${spanColor(temp1, 'magenta')}${plus()}${spanColor(temp3, 'green')}${equal()}${spanColor(answer, 'default')}",
      );
    } else {
      temp3 = op2 % 10;
      temp2 = op2 - temp3;
      temp1 = op1 - temp2;

      steps += createStepLabel(
        stepNo: 1,
        text: l10n.math_tricks.trick15.step1RoundDown(
          op2: op2.toString(),
          temp2: temp2.toString(),
          temp3: temp3.toString(),
        ),
      );
      steps += createStepValue(
        text:
            "${spanColor(op2, 'blue')}${minus()}${spanColor(temp3, 'green')}${equal()}${spanColor(temp2, 'yellow')}",
      );

      steps += createStepLabel(
        stepNo: 2,
        text: l10n.math_tricks.trick15.step2(
          temp2: temp2.toString(),
          op1: op1.toString(),
        ),
      );
      steps += createStepValue(
        text:
            "${spanColor(op1, 'red')}${minus()}${spanColor(temp2, 'yellow')}${equal()}${spanColor(temp1, 'magenta')}",
      );

      steps += createStepLabel(
        stepNo: 3,
        text: l10n.math_tricks.trick15.step3RoundDown(temp3: temp3.toString()),
      );
      steps += createStepValue(
        text:
            "${spanColor(temp1, 'magenta')}${minus()}${spanColor(temp3, 'green')}${equal()}${spanColor(answer, 'default')}",
      );
    }

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 - $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 - $op2 = $answer'),
    );
  }
}
