import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick37MultiplyBy05 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late double op2;

  Trick37MultiplyBy05(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 20) + 1;
    ans += 1;

    switch (chapterKey) {
      case 'trick37MultiplyBy05':
        op2 = 0.5;
        op1 = ans * 2;
        break;
      case 'trick42MultiplyBy025':
        op2 = 0.25;
        op1 = ans * 4;
        break;
      default:
        op2 = 0.5;
        op1 = ans * 2;
    }

    answer = ans;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick37MultiplyBy05':
        op1 = 16;
        op2 = 0.5;
        break;
      case 'trick42MultiplyBy025':
        op1 = 24;
        op2 = 0.25;
        break;
      default:
        op1 = 16;
        op2 = 0.5;
    }
    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int divisor = 2;
    switch (chapterKey) {
      case 'trick37MultiplyBy05':
        divisor = 2;
        break;
      case 'trick42MultiplyBy025':
        divisor = 4;
        break;
      default:
        divisor = 2;
    }

    String steps = "";

    // Step 1: Divide by Divisor
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick37.step1(
        divisor: divisor.toString(),
        multiplier: op2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${divide()}${spanColor(divisor, 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
