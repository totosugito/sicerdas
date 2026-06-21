import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick68MultiplyBy18 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick68MultiplyBy18(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    op1 = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10) + 1;
    switch (chapterKey) {
      case 'trick62MultiplyBy8':
        op2 = 8;
        break;
      case 'trick68MultiplyBy18':
        op2 = 18;
        break;
      case 'trick69MultiplyBy19':
        op2 = 19;
        break;
      default:
        op2 = 8;
    }

    ans = op1 * op2;
    answer = ans;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick62MultiplyBy8':
        op1 = 24;
        op2 = 8;
        break;
      case 'trick68MultiplyBy18':
        op1 = 16;
        op2 = 18;
        break;
      case 'trick69MultiplyBy19':
        op1 = 20;
        op2 = 19;
        break;
      default:
        op1 = 24;
        op2 = 8;
    }
    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int var1 = 0;
    int var2 = 0;
    switch (chapterKey) {
      case 'trick62MultiplyBy8':
        var1 = 10;
        var2 = 2;
        break;
      case 'trick68MultiplyBy18':
        var1 = 20;
        var2 = 2;
        break;
      case 'trick69MultiplyBy19':
        var1 = 20;
        var2 = 1;
        break;
      default:
        var1 = 10;
        var2 = 2;
    }

    final int temp1 = op1 * var1;
    final int temp2 = op1 * var2;

    String steps = "";

    // Step 1: Multiply by var1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick68.step1(
        var1: var1.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${times()}${spanColor(var1, 'green')}${equal()}${spanColor(temp1, 'magenta')}",
    );

    // Step 2: Multiply by var2
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick68.step2(
        var2: var2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${times()}${spanColor(var2, 'yellow')}${equal()}${spanColor(temp2, 'blue')}",
    );

    // Step 3: Subtract Step 2 result from Step 1 result
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick68.step3(
        temp1: temp1.toString(),
        temp2: temp2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'magenta')}${minus()}${spanColor(temp2, 'blue')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
