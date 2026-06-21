import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick58Percent200 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick58Percent200(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10);
    ans += 1;
    op2 = ans;

    switch (chapterKey) {
      case 'trick58Percent200':
        op1 = 200;
        ans *= 2;
        break;
      case 'trick99Percent300':
        op1 = 300;
        ans *= 3;
        break;
      case 'trick100Percent500':
        op1 = 500;
        ans *= 5;
        break;
      default:
        op1 = 200;
        ans *= 2;
    }

    answer = ans;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick58Percent200':
        op1 = 200;
        op2 = 30;
        break;
      case 'trick99Percent300':
        op1 = 300;
        op2 = 20;
        break;
      case 'trick100Percent500':
        op1 = 500;
        op2 = 20;
        break;
      default:
        op1 = 200;
        op2 = 30;
    }
    answer = (op1 * op2) ~/ 100;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);
    final int var1 = op1 ~/ 100;

    String steps = "";

    // Step 1: Explain that op1% = 100% * var1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick58.step1,
    );
    steps += createStepValue(
      text:
          "${spanColor('$op1%', 'red')}${equal()}100%${times()}${spanColor(var1, 'yellow')}",
    );

    // Step 2: Multiply op2 by var1
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick58.step2(multiplier: var1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(op2, 'blue')}${times()}${spanColor(var1, 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1% ${l10n.math_tricks.of} $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1% ${l10n.math_tricks.of} $op2 = $answer'),
    );
  }
}
