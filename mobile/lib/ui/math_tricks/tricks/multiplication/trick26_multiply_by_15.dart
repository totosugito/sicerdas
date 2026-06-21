import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick26MultiplyBy15 extends BaseTrick {
  late int op1;
  late int op2;

  Trick26MultiplyBy15(super.level);

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    op1 = ((BaseTrick.random.nextDouble() * 15.0).toInt()) + ((i - 1) * 4) + 1;
    op2 = 15;

    ans = op1 * op2;
    answer = ans;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 26;
    op2 = 15;
    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    const int multiplier = 10;
    const int divisor = 2;
    final int temp1 = op1 * multiplier;
    final int temp2 = temp1 ~/ divisor;

    String steps = "";

    // Step 1: Multiply by 10
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick26.step1(
        multiplier: multiplier.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${times()}${spanColor(multiplier, 'green')}${equal()}${spanColor(temp1, 'magenta')}",
    );

    // Step 2: Divide by 2
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick26.step2(
        temp1: temp1.toString(),
        divisor: divisor.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'magenta')}${divide()}${spanColor(divisor, 'yellow')}${equal()}${spanColor(temp2, 'blue')}",
    );

    // Step 3: Add Step 1 and Step 2 results
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick26.step3(
        temp1: temp1.toString(),
        temp2: temp2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'magenta')}${plus()}${spanColor(temp2, 'blue')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
