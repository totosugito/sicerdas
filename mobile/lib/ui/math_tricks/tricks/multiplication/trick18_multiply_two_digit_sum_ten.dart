import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick18MultiplyTwoDigitSumTen extends BaseTrick {
  late int op1;
  late int op2;

  Trick18MultiplyTwoDigitSumTen(super.level);

  @override
  void generateData() {
    if (level <= 15) {
      op1 = ((BaseTrick.random.nextDouble() * 29.0) + 11).toInt() + (level * 4);
    } else {
      op1 = ((BaseTrick.random.nextDouble() * 29.0) + 11).toInt() + 60;
    }

    if (op1 % 10 == 0) {
      op1 += 1;
    }

    // Ensure it is 2 digit number
    if (op1 < 10) op1 = 11;
    if (op1 > 99) op1 = 95;

    op2 = ((op1 ~/ 10) * 10) + (10 - (op1 % 10));

    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 26;
    op2 = 24;
    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    final int temp1 = op1 % 10;
    final int temp2 = op2 % 10;
    final int temp3 = op1 ~/ 10;
    final int temp4 = temp3 * (temp3 + 1);
    final int temp5 = temp1 * temp2;

    final String step2ValStr = temp5 <= 9 ? "0$temp5" : "$temp5";

    String steps = "";

    // Step 1: Multiply tens digit by (tens digit + 1)
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick18.step1(tens: temp3.toString()),
    );
    steps += createStepValue(
      text: "${spanColor(temp3, 'red')}${times()}(${spanColor(temp3, 'red')} + 1)${equal()}${spanColor(temp4, 'magenta')}",
    );

    // Step 2: Multiply ones digits
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick18.step2(
        ones1: temp1.toString(),
        ones2: temp2.toString(),
      ),
    );
    steps += createStepValue(
      text: "${spanColor(temp1, 'blue')}${times()}${spanColor(temp2, 'green')}${equal()}${spanColor(step2ValStr, 'yellow')}",
    );

    // Step 3: Combine side by side
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick18.step3(
        val1: temp4.toString(),
        val2: step2ValStr,
      ),
    );
    steps += createStepValue(
      text: "${spanColor(temp4, 'magenta')}${spanColor(step2ValStr, 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
