import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick66MultiplyBy16 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick66MultiplyBy16(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    op1 = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10) + 1;
    switch (chapterKey) {
      case 'trick66MultiplyBy16':
        op2 = 16;
        break;
      case 'trick67MultiplyBy17':
        op2 = 17;
        break;
      default:
        op2 = 16;
    }

    ans = op1 * op2;
    answer = ans;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick66MultiplyBy16':
        op1 = 15;
        op2 = 16;
        break;
      case 'trick67MultiplyBy17':
        op1 = 15;
        op2 = 17;
        break;
      default:
        op1 = 15;
        op2 = 16;
    }
    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    const int var1 = 10;
    const int var2 = 5;
    int var3 = 0;
    switch (chapterKey) {
      case 'trick66MultiplyBy16':
        var3 = 1;
        break;
      case 'trick67MultiplyBy17':
        var3 = 2;
        break;
      default:
        var3 = 1;
    }

    final int temp1 = op1 * var1;
    final int temp2 = op1 * var2;
    final int temp3 = op1 * var3;

    String steps = "";

    // Step 1: Multiply by 10
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick66.step1(
        var1: var1.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${times()}${spanColor(var1, 'green')}${equal()}${spanColor(temp1, 'magenta')}",
    );

    // Step 2: Multiply by 5
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick66.step2(
        var2: var2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${times()}${spanColor(var2, 'yellow')}${equal()}${spanColor(temp2, 'blue')}",
    );

    // Step 3: Multiply by var3
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick66.step3(
        var3: var3.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${times()}${spanColor(var3, 'green')}${equal()}${spanColor(temp3, 'yellow')}",
    );

    // Step 4: Add Step 1, Step 2, and Step 3 results
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.trick66.step4(
        temp1: temp1.toString(),
        temp2: temp2.toString(),
        temp3: temp3.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'magenta')}${plus()}${spanColor(temp2, 'blue')}${plus()}${spanColor(temp3, 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
