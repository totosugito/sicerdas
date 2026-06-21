import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick39SquareEndingIn25 extends BaseTrick {
  late int op1;
  late int op2;

  Trick39SquareEndingIn25(super.level);

  @override
  void generateData() {
    final int i = level;
    int temp = ((BaseTrick.random.nextDouble() * 10.0).toInt()) + i;
    op1 = (temp * 100) + 25;
    op2 = 2;
    answer = op1 * op1;

    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 325;
    op2 = 2;
    answer = op1 * op1;
    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    final int temp1 = op1 ~/ 100;
    final int temp2 = temp1 * temp1;
    final double float1 = temp1 / 2.0;
    final double float2 = temp2 + float1;
    final int temp3 = (float2 * 10.0).toInt();

    final String float1Str = (temp1 % 2 == 0) ? float1.toInt().toString() : float1.toString();
    final String float2Str = ((float2 * 10) % 2 == 0) ? float2.toInt().toString() : float2.toString();

    String steps = "";

    // Step 1: Square temp1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick39.step1(temp1: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'red')}²${equal()}${spanColor(temp2, 'yellow')}",
    );

    // Step 2: Divide temp1 by 2
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick39.step2(temp1: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'red')}${divide()}2${equal()}${spanColor(float1Str, 'green')}",
    );

    // Step 3: Add Step 1 and Step 2 results
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.step_add_step1_by_step2,
    );
    steps += createStepValue(
      text:
          "${spanColor(temp2, 'yellow')}${plus()}${spanColor(float1Str, 'green')}${equal()}${spanColor(float2Str, 'magenta')}",
    );

    // Step 4: Multiply Step 3 result by 10
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.step_multiply_step3_by(multiplier: '10'),
    );
    steps += createStepValue(
      text:
          "${spanColor(float2Str, 'magenta')}${times()}10${equal()}${spanColor(temp3, 'cyan')}",
    );

    // Step 5: Append 625
    steps += createStepLabel(
      stepNo: 5,
      text: l10n.math_tricks.trick39.step5,
    );
    steps += createStepValue(
      text:
          "${spanColor(temp3, 'cyan')}_${spanColor('625', 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1²',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1² = $answer'),
    );
  }
}
