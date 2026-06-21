import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick16MultiplyBetween11And19 extends BaseTrick {
  late int op1;
  late int op2;

  Trick16MultiplyBetween11And19(super.level);

  @override
  void generateData() {
    op1 = ((BaseTrick.random.nextDouble() * 9.0).toInt()) + 11;
    op2 = ((BaseTrick.random.nextDouble() * 9.0).toInt()) + 11;

    if (level <= 15) {
      op1 = ((BaseTrick.random.nextDouble() * 4.0).toInt() + 11) + (level ~/ 3);
      op2 = ((BaseTrick.random.nextDouble() * 4.0).toInt() + 11) + (level ~/ 3);
    }

    if (op1 < op2) {
      final int temp = op2;
      op2 = op1;
      op1 = temp;
    }

    // Double check op1 and op2 bounds
    if (op1 < 11) op1 = 11;
    if (op1 > 19) op1 = 19;
    if (op2 < 11) op2 = 11;
    if (op2 > 19) op2 = 19;

    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 16;
    op2 = 12;
    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    final int temp1 = op1 % 10;
    final int temp2 = op2 % 10;
    final int temp3 = op1 + temp2;
    final int temp4 = temp1 * temp2;

    String steps = "";

    // Step 1: Add larger number to ones digit of smaller number
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick16.step1(
        op1: op1.toString(),
        digit: temp2.toString(),
      ),
    );
    steps += createStepValue(
      text: "${spanColor(op1, 'blue')}${plus()}${spanColor(temp2, 'green')}${equal()}${spanColor(temp3, 'yellow')}",
    );

    // Step 2: Multiply by 10
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick16.step2(temp3: temp3.toString()),
    );
    steps += createStepValue(
      text: "${spanColor(temp3, 'yellow')}${times()}10${equal()}${spanColor(temp3 * 10, 'magenta')}",
    );

    // Step 3: Multiply ones digits
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick16.step3(
        digit1: temp1.toString(),
        digit2: temp2.toString(),
      ),
    );
    steps += createStepValue(
      text: "${spanColor(temp1, 'red')}${times()}${spanColor(temp2, 'green')}${equal()}${spanColor(temp4, 'blue')}",
    );

    // Step 4: Add step 2 and step 3 results
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.trick16.step4(
        step2Val: (temp3 * 10).toString(),
        step3Val: temp4.toString(),
      ),
    );
    steps += createStepValue(
      text: "${spanColor(temp3 * 10, 'magenta')}${plus()}${spanColor(temp4, 'blue')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
