import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick28DivideBy4 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick28DivideBy4(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    switch (chapterKey) {
      case 'trick28DivideBy4':
        ans = ((BaseTrick.random.nextDouble() * 10.0).toInt() + ((i - 1) * 10)) + 2;
        op2 = 4;
        break;
      case 'trick29DivideBy20':
        ans = ((BaseTrick.random.nextDouble() * 10.0).toInt() + ((i - 1) * 10)) + 2;
        op2 = 20;
        break;
      case 'trick36DivideBy40':
        ans = ((BaseTrick.random.nextDouble() * 20.0).toInt() + ((i - 1) * 20)) + 2;
        op2 = 40;
        break;
      case 'trick72DivideBy6':
        ans = ((BaseTrick.random.nextDouble() * 20.0).toInt() + ((i - 1) * 20)) + 2;
        op2 = 6;
        break;
      case 'trick98DivideBy9':
        ans = ((BaseTrick.random.nextDouble() * 20.0).toInt() + ((i - 1) * 20)) + 2;
        op2 = 9;
        break;
      default:
        ans = ((BaseTrick.random.nextDouble() * 10.0).toInt() + ((i - 1) * 10)) + 2;
        op2 = 4;
    }

    op1 = ans * op2;
    answer = ans;
    questionText = '$op1${divide()}$op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick28DivideBy4':
        op1 = 248;
        op2 = 4;
        break;
      case 'trick29DivideBy20':
        op1 = 380;
        op2 = 20;
        break;
      case 'trick36DivideBy40':
        op1 = 360;
        op2 = 40;
        break;
      case 'trick72DivideBy6':
        op1 = 246;
        op2 = 6;
        break;
      case 'trick98DivideBy9':
        op1 = 279;
        op2 = 9;
        break;
      default:
        op1 = 248;
        op2 = 4;
    }
    answer = op1 / op2;
    questionText = '$op1${divide()}$op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int var1 = 0;
    int var2 = 0;
    switch (chapterKey) {
      case 'trick28DivideBy4':
        var1 = 2;
        var2 = 2;
        break;
      case 'trick29DivideBy20':
        var1 = 10;
        var2 = 2;
        break;
      case 'trick36DivideBy40':
        var1 = 10;
        var2 = 4;
        break;
      case 'trick72DivideBy6':
        var1 = 2;
        var2 = 3;
        break;
      case 'trick98DivideBy9':
        var1 = 3;
        var2 = 3;
        break;
      default:
        var1 = 2;
        var2 = 2;
    }

    final int temp1 = op1 ~/ var1;
    final String answerStr = (answer % 1 == 0) ? answer.toInt().toString() : answer.toString();

    String steps = "";

    // Step 1: Divide by var1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick28.step1(divisor1: var1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${divide()}${spanColor(var1, 'yellow')}${equal()}${spanColor(temp1, 'green')}",
    );

    // Step 2: Divide result by var2
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick28.step2(temp1: temp1.toString(), divisor2: var2.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'green')}${divide()}${spanColor(var2, 'magenta')}${equal()}${spanColor(answerStr, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1${divide()}$op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1${divide()}$op2 = $answerStr'),
    );
  }
}
