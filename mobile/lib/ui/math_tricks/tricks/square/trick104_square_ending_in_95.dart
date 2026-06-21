import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick104SquareEndingIn95 extends BaseTrick {
  late int op1;
  late int op2;

  Trick104SquareEndingIn95(super.level);

  @override
  void generateData() {
    final int i = level;
    int temp = ((BaseTrick.random.nextDouble() * 10.0).toInt()) + i;
    op1 = (temp * 100) + 95;
    op2 = 2;
    answer = op1 * op1;

    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 895;
    op2 = 2;
    answer = op1 * op1;
    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    final int temp1 = op1 ~/ 100;
    final int temp2 = temp1 + 1;
    final int temp3 = temp2 * temp2;
    final int temp4 = (temp3 * 10) - temp2;

    String steps = "";

    // Step 1: Add 1 to temp1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick104.step1(temp1: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'red')}${plus()}1${equal()}${spanColor(temp2, 'blue')}",
    );

    // Step 2: Square temp2
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick104.step2(temp2: temp2.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp2, 'blue')}²${equal()}${spanColor(temp3, 'yellow')}",
    );

    // Step 3: Multiply temp3 by 10 and subtract temp2
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick104.step3(temp3: temp3.toString(), temp2: temp2.toString()),
    );
    steps += createStepValue(
      text:
          "(${spanColor(temp3, 'yellow')}${times()}10)${minus()}${spanColor(temp2, 'blue')}${equal()}${spanColor(temp4, 'green')}",
    );

    // Step 4: Append 025
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.trick104.step4,
    );
    steps += createStepValue(
      text:
          "${spanColor(temp4, 'green')}_${spanColor('025', 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1²',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1² = $answer'),
    );
  }
}
