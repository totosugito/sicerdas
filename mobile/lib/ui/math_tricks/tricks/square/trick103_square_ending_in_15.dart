import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick103SquareEndingIn15 extends BaseTrick {
  late int op1;
  late int op2;

  Trick103SquareEndingIn15(super.level);

  @override
  void generateData() {
    final int i = level;
    int temp = ((BaseTrick.random.nextDouble() * 10.0).toInt()) + i;
    op1 = (temp * 100) + 15;
    op2 = 2;
    answer = op1 * op1;

    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 315;
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
    final int temp3 = ((temp2 + float1) * 10.0).toInt();
    final int temp4 = temp1 * 2;
    final int temp5 = temp3 - temp4;

    final String float1Str = (temp1 % 2 == 0) ? float1.toInt().toString() : float1.toString();

    String steps = "";

    // Step 1: Square temp1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick103.step1(temp1: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'blue')}²${equal()}${spanColor(temp2, 'yellow')}",
    );

    // Step 2: Calculate (temp2 + (temp1 / 2)) * 10
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick103.step2(temp2: temp2.toString(), float1: float1Str),
    );
    steps += createStepValue(
      text:
          "(${spanColor(temp2, 'yellow')}${plus()}(${spanColor(temp1, 'blue')}${divide()}2))${times()}10${equal()}${spanColor(temp3, 'green')}",
    );

    // Step 3: Multiply temp1 by 2
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick103.step3(temp1: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'blue')}${times()}2${equal()}${spanColor(temp4, 'magenta')}",
    );

    // Step 4: Subtract step 3 from step 2
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.trick103.step4(temp3: temp3.toString(), temp4: temp4.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp3, 'green')}${minus()}${spanColor(temp4, 'magenta')}${equal()}${spanColor(temp5, 'cyan')}",
    );

    // Step 5: Append 225
    steps += createStepLabel(
      stepNo: 5,
      text: l10n.math_tricks.trick103.step5,
    );
    steps += createStepValue(
      text:
          "${spanColor(temp5, 'cyan')}_${spanColor('225', 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1²',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1² = $answer'),
    );
  }
}
