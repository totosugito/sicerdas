import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick32SquareBetween10And19 extends BaseTrick {
  late int op1;
  late int op2;

  Trick32SquareBetween10And19(super.level);

  @override
  void generateData() {
    final int i = level;
    int temp = (i <= 3)
        ? (BaseTrick.random.nextDouble() * 6.0).toInt()
        : (BaseTrick.random.nextDouble() * 10.0).toInt();
    op1 = 10 + temp;
    op2 = 2;
    answer = op1 * op1;

    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 14;
    op2 = 2;
    answer = op1 * op1;
    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    final int temp1 = op1 % 10;
    final int temp2 = op1 + temp1;
    final int temp3 = temp1 * temp1;
    final int temp4 = temp2 * 10;

    String steps = "";

    // Step 1: op1 + temp1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick32.step1(op1: op1.toString(), temp1: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${plus()}${spanColor(temp1, 'blue')}${equal()}${spanColor(temp2, 'yellow')}",
    );

    // Step 2: temp2 * 10
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick32.step2(temp2: temp2.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp2, 'yellow')}${times()}10${equal()}${spanColor(temp4, 'magenta')}",
    );

    // Step 3: Square temp1
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick32.step3(temp1: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'blue')}²${equal()}${spanColor(temp3, 'cyan')}",
    );

    // Step 4: Add step 2 and step 3
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.step_add_step2_by_step3,
    );
    steps += createStepValue(
      text:
          "${spanColor(temp4, 'magenta')}${plus()}${spanColor(temp3, 'cyan')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1²',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1² = $answer'),
    );
  }
}
