import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick07MultiplyBy5 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late num op2;

  Trick07MultiplyBy5(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    switch (chapterKey) {
      case 'trick07MultiplyBy5':
        op1 = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + (i * 10);
        op2 = 5;
        ans = op1 * op2.toInt();
        break;
      case 'trick34MultiplyBy25':
        op1 =
            ((BaseTrick.random.nextDouble() * 20.0).toInt()) +
            ((i - 1) * 5) +
            1;
        op1 += 2;
        op2 = 25;
        ans = op1 * op2.toInt();
        break;
      case 'trick35MultiplyBy50':
        op1 =
            ((BaseTrick.random.nextDouble() * 20.0).toInt()) +
            ((i - 1) * 10) +
            1;
        op2 = 50;
        ans = op1 * op2.toInt();
        break;
      case 'trick40MultiplyBy02':
        op1 =
            ((BaseTrick.random.nextDouble() * 20.0).toInt()) +
            ((i - 1) * 20) +
            1;
        ans = op1;
        op1 *= 5;
        op2 = 0.2;
        break;
      case 'trick90MultiplyBy125':
        op1 =
            ((BaseTrick.random.nextDouble() * 20.0).toInt()) +
            ((i - 1) * 10) +
            1;
        op2 = 125;
        ans = op1 * op2.toInt();
        break;
      case 'trick93MultiplyBy250':
        op1 =
            ((BaseTrick.random.nextDouble() * 20.0).toInt()) +
            ((i - 1) * 10) +
            1;
        op2 = 250;
        ans = op1 * op2.toInt();
        break;
      case 'trick94MultiplyBy500':
        op1 =
            ((BaseTrick.random.nextDouble() * 20.0).toInt()) +
            ((i - 1) * 10) +
            1;
        op2 = 500;
        ans = op1 * op2.toInt();
        break;
      default:
        op1 = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + (i * 10);
        op2 = 5;
        ans = op1 * op2.toInt();
    }

    answer = ans;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int divisor = 2;
    int multiplier = 10;

    switch (chapterKey) {
      case 'trick07MultiplyBy5':
        divisor = 2;
        multiplier = 10;
        break;
      case 'trick34MultiplyBy25':
        divisor = 4;
        multiplier = 100;
        break;
      case 'trick35MultiplyBy50':
        divisor = 2;
        multiplier = 100;
        break;
      case 'trick40MultiplyBy02':
        divisor = 10;
        multiplier = 2;
        break;
      case 'trick90MultiplyBy125':
        divisor = 8;
        multiplier = 1000;
        break;
      case 'trick93MultiplyBy250':
        divisor = 4;
        multiplier = 1000;
        break;
      case 'trick94MultiplyBy500':
        divisor = 2;
        multiplier = 1000;
        break;
      default:
        divisor = 2;
        multiplier = 10;
    }

    final double floatVal = op1 / divisor;
    final String tempStr = (op1 % divisor == 0)
        ? floatVal.toInt().toString()
        : floatVal.toString();

    String steps = "";

    // Step 1: Divide by Divisor
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick07.step1(divisor: divisor.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${divide()}${spanColor(divisor, 'green')}${equal()}${spanColor(tempStr, 'magenta')}",
    );

    // Step 2: Multiply by Multiplier
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick07.step2(
        multiplier: multiplier.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(tempStr, 'magenta')}${times()}${spanColor(multiplier, 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
