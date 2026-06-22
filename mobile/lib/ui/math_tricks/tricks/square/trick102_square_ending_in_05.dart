import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick102SquareEndingIn05 extends BaseTrick {
  late int op1;
  late int op2;

  Trick102SquareEndingIn05(super.level);

  @override
  void generateData() {
    final int i = level;
    int temp = ((BaseTrick.random.nextDouble() * 10.0).toInt()) + i;
    op1 = (temp * 100) + 5;
    op2 = 2;
    answer = op1 * op1;

    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 305;
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
    final int temp3 = (temp2 * 10) + temp1;

    String steps = "";

    // Step 1: Square temp1
    steps += createStepLabel(stepNo: 1, text: l10n.math_tricks.trick102.step1(temp1: temp1.toString()));
    steps += createStepValue(text: "${spanColor(temp1, 'blue')}²${equal()}${spanColor(temp2, 'yellow')}");

    // Step 2: Multiply by 10 and add temp1
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick102.step2(temp2: temp2.toString(), temp1: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp2, 'yellow')}${times()}10${plus()}${spanColor(temp1, 'blue')}${equal()}${spanColor(temp3, 'green')}",
    );

    // Step 3: Append 025
    steps += createStepLabel(stepNo: 3, text: l10n.math_tricks.trick102.step3);
    steps += createStepValue(
      text: "${spanColor(temp3, 'green')}_${spanColor('025', 'magenta')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1²',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1² = $answer'),
    );
  }
}
