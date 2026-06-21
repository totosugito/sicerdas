import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick10DivideBy5 extends BaseTrick {
  final String chapterKey;
  late double op1;
  late double op2;

  String get op1Str => op1 % 1 == 0 ? op1.toInt().toString() : op1.toString();
  String get op2Str => op2 % 1 == 0 ? op2.toInt().toString() : op2.toString();

  Trick10DivideBy5(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    switch (chapterKey) {
      case 'trick10DivideBy5':
        ans = ((BaseTrick.random.nextDouble() * 20.0).toInt() + ((i - 1) * 20)) + 1;
        op2 = 5;
        op1 = (ans * op2).toDouble();
        break;
      case 'trick30DivideBy50':
        ans = ((BaseTrick.random.nextDouble() * 10.0).toInt() + ((i - 1) * 10)) + 1;
        ans += 1;
        op2 = 50;
        op1 = (ans * op2).toDouble();
        break;
      case 'trick31DivideBy25':
        ans = ((BaseTrick.random.nextDouble() * 10.0).toInt() + ((i - 1) * 10)) + 1;
        ans += 1;
        op2 = 25;
        op1 = (ans * op2).toDouble();
        break;
      case 'trick41DivideBy02':
        final int tempOp1 = ((BaseTrick.random.nextDouble() * 20.0).toInt() + ((i - 1) * 20)) + 1;
        op1 = tempOp1.toDouble();
        op2 = 0.2;
        ans = tempOp1 * 5;
        break;
      default:
        ans = ((BaseTrick.random.nextDouble() * 20.0).toInt() + ((i - 1) * 20)) + 1;
        op2 = 5;
        op1 = (ans * op2).toDouble();
    }

    answer = ans;
    questionText = '$op1Str${divide()}$op2Str';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick10DivideBy5':
        op1 = 345;
        op2 = 5;
        break;
      case 'trick30DivideBy50':
        op1 = 450;
        op2 = 50;
        break;
      case 'trick31DivideBy25':
        op1 = 450;
        op2 = 25;
        break;
      case 'trick41DivideBy02':
        op1 = 20;
        op2 = 0.2;
        break;
      default:
        op1 = 345;
        op2 = 5;
    }
    answer = op1 / op2;
    questionText = '$op1Str${divide()}$op2Str';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int var1 = 0;
    int var2 = 0;
    switch (chapterKey) {
      case 'trick10DivideBy5':
        var1 = 10;
        var2 = 2;
        break;
      case 'trick30DivideBy50':
        var1 = 100;
        var2 = 2;
        break;
      case 'trick31DivideBy25':
        var1 = 100;
        var2 = 4;
        break;
      case 'trick41DivideBy02':
        var1 = 2;
        var2 = 10;
        break;
      default:
        var1 = 10;
        var2 = 2;
    }

    final double temp1 = op1 / var1;
    final String temp1Str = (temp1 % 1 == 0) ? temp1.toInt().toString() : temp1.toStringAsFixed(1);
    final String answerStr = (answer % 1 == 0) ? answer.toInt().toString() : answer.toString();

    String steps = "";

    // Step 1: Divide by var1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick10.step1(divisor: var1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1Str, 'red')}${divide()}${spanColor(var1, 'green')}${equal()}${spanColor(temp1Str, 'magenta')}",
    );

    // Step 2: Multiply by var2
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick10.step2(temp1: temp1Str, multiplier: var2.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1Str, 'magenta')}${times()}${spanColor(var2, 'yellow')}${equal()}${spanColor(answerStr, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1Str${divide()}$op2Str',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1Str${divide()}$op2Str = $answerStr'),
    );
  }
}
