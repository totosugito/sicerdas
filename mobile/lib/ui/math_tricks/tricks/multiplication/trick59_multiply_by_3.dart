import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick59MultiplyBy3 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick59MultiplyBy3(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    op1 = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10) + 1;

    switch (chapterKey) {
      case 'trick59MultiplyBy3':
        op2 = 3;
        break;
      case 'trick63MultiplyBy12':
        op2 = 12;
        break;
      case 'trick64MultiplyBy13':
        op2 = 13;
        break;
      case 'trick65MultiplyBy14':
        op2 = 14;
        break;
      case 'trick05MultiplyTwoDigitBy11':
        op2 = 11;
        break;
      default:
        op2 = 3;
    }

    ans = op1 * op2;
    answer = ans;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick59MultiplyBy3':
        op1 = 16;
        op2 = 3;
        break;
      case 'trick63MultiplyBy12':
        op1 = 16;
        op2 = 12;
        break;
      case 'trick64MultiplyBy13':
        op1 = 18;
        op2 = 13;
        break;
      case 'trick65MultiplyBy14':
        op1 = 20;
        op2 = 14;
        break;
      case 'trick05MultiplyTwoDigitBy11':
        op1 = 24;
        op2 = 11;
        break;
      default:
        op1 = 16;
        op2 = 3;
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
      case 'trick59MultiplyBy3':
        var1 = 2;
        var2 = 1;
        break;
      case 'trick63MultiplyBy12':
        var1 = 10;
        var2 = 2;
        break;
      case 'trick64MultiplyBy13':
        var1 = 10;
        var2 = 3;
        break;
      case 'trick65MultiplyBy14':
        var1 = 10;
        var2 = 4;
        break;
      case 'trick05MultiplyTwoDigitBy11':
        var1 = 10;
        var2 = 1;
        break;
      default:
        var1 = 2;
        var2 = 1;
    }

    final int temp1 = op1 * var1;
    final int temp2 = op1 * var2;

    String steps = "";

    // Step 1: Multiply by var1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick59.step1(
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
      text: l10n.math_tricks.trick59.step2(
        var2: var2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${times()}${spanColor(var2, 'yellow')}${equal()}${spanColor(temp2, 'blue')}",
    );

    // Step 3: Add Step 1 and Step 2 results
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick59.step3(
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
