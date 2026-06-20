import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick21MultiplyTwoDigitEndingIn1 extends BaseTrick {
  late int op1;
  late int op2;

  Trick21MultiplyTwoDigitEndingIn1(super.level);

  @override
  void generateData() {
    int tempOp1, tempOp2;
    if (level <= 15) {
      tempOp1 = ((BaseTrick.random.nextDouble() * 4.0) + (level / 3)).toInt() + 1;
      tempOp2 = ((BaseTrick.random.nextDouble() * 4.0) + (level / 3)).toInt() + 1;
    } else {
      tempOp1 = (BaseTrick.random.nextDouble() * 4.0).toInt() + 5 + 1;
      tempOp2 = (BaseTrick.random.nextDouble() * 4.0).toInt() + 5 + 1;
    }

    if (tempOp1 < 1) tempOp1 = 1;
    if (tempOp1 > 9) tempOp1 = 9;
    if (tempOp2 < 1) tempOp2 = 1;
    if (tempOp2 > 9) tempOp2 = 9;

    op1 = (tempOp1 * 10) + 1;
    op2 = (tempOp2 * 10) + 1;

    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    final int tens1 = op1 ~/ 10;
    final int tens2 = op2 ~/ 10;
    final int temp13M = tens1 * tens2;
    final int temp13A = tens1 + tens2;
    final int combinedResult = temp13M * 10 + temp13A;

    String steps = "";

    // Step 1: Multiply tens digits
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick21.step1(
        tens1: tens1.toString(),
        tens2: tens2.toString(),
      ),
    );
    steps += createStepValue(
      text: "${spanColor(tens1, 'red')}${times()}${spanColor(tens2, 'blue')}${equal()}${spanColor(temp13M, 'yellow')}",
    );

    // Step 2: Add tens digits
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick21.step2(
        tens1: tens1.toString(),
        tens2: tens2.toString(),
      ),
    );
    steps += createStepValue(
      text: "${spanColor(tens1, 'red')}${plus()}${spanColor(tens2, 'blue')}${equal()}${spanColor(temp13A, 'green')}",
    );

    // Step 3: Combine them
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick21.step3(
        val1: temp13M.toString(),
        val2: temp13A.toString(),
      ),
    );
    steps += createStepValue(
      text: "(${spanColor(temp13M, 'yellow')} × 10) ${plus()} ${spanColor(temp13A, 'green')} ${equal()} ${spanColor(combinedResult, 'magenta')}",
    );

    // Step 4: Append 1 to the end
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.trick21.step4,
    );
    steps += createStepValue(
      text: "(${spanColor(combinedResult, 'magenta')} × 10) ${plus()} 1 ${equal()} ${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
