import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick17SquareBetween90And99 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick17SquareBetween90And99(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int temp = (i <= 3)
        ? (BaseTrick.random.nextDouble() * 6.0).toInt()
        : (BaseTrick.random.nextDouble() * 9.0).toInt();

    switch (chapterKey) {
      case 'trick17SquareBetween90And99':
        op1 = 99 - temp;
        break;
      case 'trick23SquareBetween100And109':
        op1 = 100 + temp;
        break;
      default:
        op1 = 99 - temp;
    }

    op2 = 2;
    answer = op1 * op1;

    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick17SquareBetween90And99':
        op1 = 92;
        break;
      case 'trick23SquareBetween100And109':
        op1 = 103;
        break;
      default:
        op1 = 92;
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

    if (chapterKey == 'trick17SquareBetween90And99') {
      final int temp2 = 100 - op1;
      final int temp3 = op1 - temp2;
      final int temp4 = temp2 * temp2;
      final String temp4Str = temp4 <= 9 ? "0$temp4" : "$temp4";

      // Step 1: 100 - op1
      steps += createStepLabel(
        stepNo: 1,
        text: l10n.math_tricks.trick17.step1(temp1: op1.toString()),
      );
      steps += createStepValue(
        text:
            "100${minus()}${spanColor(op1, 'red')}${equal()}${spanColor(temp2, 'blue')}",
      );

      // Step 2: op1 - temp2
      steps += createStepLabel(
        stepNo: 2,
        text: l10n.math_tricks.trick17.step2(temp1: op1.toString(), temp2: temp2.toString()),
      );
      steps += createStepValue(
        text:
            "${spanColor(op1, 'red')}${minus()}${spanColor(temp2, 'blue')}${equal()}${spanColor(temp3, 'yellow')}",
      );

      // Step 3: Square temp2
      steps += createStepLabel(
        stepNo: 3,
        text: l10n.math_tricks.trick17.step3(temp2: temp2.toString()),
      );
      steps += createStepValue(
        text:
            "${spanColor(temp2, 'blue')}²${equal()}${spanColor(temp4Str, 'green')}",
      );

      // Step 4: Combine temp3 and temp4
      steps += createStepLabel(
        stepNo: 4,
        text: l10n.math_tricks.trick17.step4(temp3: temp3.toString(), temp4: temp4Str),
      );
      steps += createStepValue(
        text:
            "${spanColor(temp3, 'yellow')}_${spanColor(temp4Str, 'green')}${equal()}${spanColor(answer, 'default')}",
      );
    } else {
      // trick23SquareBetween100And109
      final int temp1 = op1 % 10;
      final int temp2 = op1 + temp1;
      final int temp3 = temp1 * temp1;
      final String temp3Str = temp3 <= 9 ? "0$temp3" : "$temp3";

      // Step 1: op1 + temp1
      steps += createStepLabel(
        stepNo: 1,
        text: l10n.math_tricks.trick23.step1(op1: op1.toString(), temp1: temp1.toString()),
      );
      steps += createStepValue(
        text:
            "${spanColor(op1, 'red')}${plus()}${spanColor(temp1, 'blue')}${equal()}${spanColor(temp2, 'yellow')}",
      );

      // Step 2: Square temp1
      steps += createStepLabel(
        stepNo: 2,
        text: l10n.math_tricks.trick23.step2(temp1: temp1.toString()),
      );
      steps += createStepValue(
        text:
            "${spanColor(temp1, 'blue')}²${equal()}${spanColor(temp3Str, 'green')}",
      );

      // Step 3: Combine temp2 and temp3
      steps += createStepLabel(
        stepNo: 3,
        text: l10n.math_tricks.trick23.step3(temp2: temp2.toString(), temp3: temp3Str),
      );
      steps += createStepValue(
        text:
            "${spanColor(temp2, 'yellow')}_${spanColor(temp3Str, 'green')}${equal()}${spanColor(answer, 'default')}",
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
