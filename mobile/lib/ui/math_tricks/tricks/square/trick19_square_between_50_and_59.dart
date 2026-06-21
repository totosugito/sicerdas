import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick19SquareBetween50And59 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick19SquareBetween50And59(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int temp = (i <= 3)
        ? (BaseTrick.random.nextDouble() * 6.0).toInt()
        : (BaseTrick.random.nextDouble() * 10.0).toInt();

    switch (chapterKey) {
      case 'trick19SquareBetween50And59':
        op1 = 50 + temp;
        break;
      case 'trick20SquareBetween40And49':
        // Ensure op1 is between 40 and 49
        int subTemp = (i <= 3)
            ? (BaseTrick.random.nextDouble() * 6.0).toInt()
            : (BaseTrick.random.nextDouble() * 9.0).toInt();
        op1 = 49 - subTemp;
        break;
      default:
        op1 = 50 + temp;
    }

    op2 = 2;
    answer = op1 * op1;

    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick19SquareBetween50And59':
        op1 = 52;
        break;
      case 'trick20SquareBetween40And49':
        op1 = 45;
        break;
      default:
        op1 = 52;
    }
    op2 = 2;
    answer = op1 * op1;
    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    String steps = "";

    if (chapterKey == 'trick19SquareBetween50And59') {
      final int temp1 = op1 % 10;
      final int temp2 = temp1 + 25;
      final int temp3 = temp1 * temp1;
      final String temp3Str = temp3 <= 9 ? "0$temp3" : "$temp3";

      // Step 1: 25 + temp1
      steps += createStepLabel(
        stepNo: 1,
        text: l10n.math_tricks.trick19.step1(temp1: temp1.toString()),
      );
      steps += createStepValue(
        text:
            "25${plus()}${spanColor(temp1, 'blue')}${equal()}${spanColor(temp2, 'yellow')}",
      );

      // Step 2: Square temp1
      steps += createStepLabel(
        stepNo: 2,
        text: l10n.math_tricks.trick19.step2(temp1: temp1.toString()),
      );
      steps += createStepValue(
        text:
            "${spanColor(temp1, 'blue')}²${equal()}${spanColor(temp3Str, 'green')}",
      );

      // Step 3: Combine temp2 and temp3
      steps += createStepLabel(
        stepNo: 3,
        text: l10n.math_tricks.trick19.step3(temp2: temp2.toString(), temp3: temp3Str),
      );
      steps += createStepValue(
        text:
            "${spanColor(temp2, 'yellow')}_${spanColor(temp3Str, 'green')}${equal()}${spanColor(answer, 'default')}",
      );
    } else {
      // trick20SquareBetween40And49
      final int temp2 = 50 - op1;
      final int temp3 = 25 - temp2;
      final int temp4 = temp2 * temp2;
      final String temp4Str = temp4 <= 9 ? "0$temp4" : "$temp4";

      // Step 1: 50 - op1
      steps += createStepLabel(
        stepNo: 1,
        text: l10n.math_tricks.trick20.step1(op1: op1.toString()),
      );
      steps += createStepValue(
        text:
            "50${minus()}${spanColor(op1, 'red')}${equal()}${spanColor(temp2, 'blue')}",
      );

      // Step 2: 25 - temp2
      steps += createStepLabel(
        stepNo: 2,
        text: l10n.math_tricks.trick20.step2(temp2: temp2.toString()),
      );
      steps += createStepValue(
        text:
            "25${minus()}${spanColor(temp2, 'blue')}${equal()}${spanColor(temp3, 'yellow')}",
      );

      // Step 3: Square temp2
      steps += createStepLabel(
        stepNo: 3,
        text: l10n.math_tricks.trick20.step3(temp2: temp2.toString()),
      );
      steps += createStepValue(
        text:
            "${spanColor(temp2, 'blue')}²${equal()}${spanColor(temp4Str, 'green')}",
      );

      // Step 4: Combine temp3 and temp4
      steps += createStepLabel(
        stepNo: 4,
        text: l10n.math_tricks.trick20.step4(temp3: temp3.toString(), temp4: temp4Str),
      );
      steps += createStepValue(
        text:
            "${spanColor(temp3, 'yellow')}_${spanColor(temp4Str, 'green')}${equal()}${spanColor(answer, 'default')}",
      );
    }

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1²',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1² = $answer'),
    );
  }
}
