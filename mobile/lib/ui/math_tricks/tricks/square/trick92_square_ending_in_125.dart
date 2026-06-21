import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick92SquareEndingIn125 extends BaseTrick {
  late int op1;
  late int op2;

  Trick92SquareEndingIn125(super.level);

  @override
  void generateData() {
    final int i = level;
    int temp = ((BaseTrick.random.nextDouble() * 10.0).toInt()) + i;
    op1 = (temp * 1000) + 125;
    op2 = 2;
    answer = op1 * op1;

    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 3125;
    op2 = 2;
    answer = op1 * op1;
    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    final int temp1 = op1 ~/ 1000;
    final int temp2 = temp1 * temp1;
    final double float1 = temp1 / 4.0;
    final double float2 = temp2 + float1;
    final int temp3 = (float2 * 100).toInt();
    final int temp4 = temp3 + 1;

    final String float1Str = (temp1 % 4 == 0) ? float1.toInt().toString() : float1.toString();

    String steps = "";

    // Step 1: Square temp1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick92.step1(temp1: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'red')}²${equal()}${spanColor(temp2, 'blue')}",
    );

    // Step 2: Divide temp1 by 4
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick92.step2(temp1: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'red')}${divide()}4${equal()}${spanColor(float1Str, 'yellow')}",
    );

    // Step 3: (temp2 + float1) * 100
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick92.step3,
    );
    steps += createStepValue(
      text:
          "(${spanColor(temp2, 'blue')}${plus()}${spanColor(float1Str, 'yellow')})${times()}100${equal()}${spanColor(temp3, 'green')}",
    );

    // Step 4: temp3 + 1
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.trick92.step4,
    );
    steps += createStepValue(
      text:
          "${spanColor(temp3, 'green')}${plus()}1${equal()}${spanColor(temp4, 'magenta')}",
    );

    // Step 5: Append 5625
    steps += createStepLabel(
      stepNo: 5,
      text: l10n.math_tricks.trick92.step5,
    );
    steps += createStepValue(
      text:
          "${spanColor(temp4, 'magenta')}_${spanColor('5625', 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1²',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1² = $answer'),
    );
  }
}
