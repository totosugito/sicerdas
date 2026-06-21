import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick91SquareEndingIn75 extends BaseTrick {
  late int op1;
  late int op2;

  Trick91SquareEndingIn75(super.level);

  @override
  void generateData() {
    final int i = level;
    int temp = ((BaseTrick.random.nextDouble() * 10.0).toInt()) + i;
    op1 = (temp * 100) + 75;
    op2 = 2;
    answer = op1 * op1;

    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 375;
    op2 = 2;
    answer = op1 * op1;
    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    final int temp1 = op1 ~/ 100;
    final int temp4 = ((temp1 * 10) + 5) * (temp1 + 1);

    String steps = "";

    // Step 1: Calculate (temp1*10+5)*(temp1+1)
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.step_do_the_calculation,
    );
    steps += createStepValue(
      text:
          "(${spanColor(temp1, 'red')}${times()}10${plus()}5)${times()}(${spanColor(temp1, 'red')}${plus()}1)${equal()}${spanColor(temp4, 'yellow')}",
    );

    // Step 2: Append 625
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick91.step2,
    );
    steps += createStepValue(
      text:
          "${spanColor(temp4, 'yellow')}_${spanColor('625', 'blue')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1²',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1² = $answer'),
    );
  }
}
