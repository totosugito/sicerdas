import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick44To48SquareBetween20And89 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick44To48SquareBetween20And89(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int temp = (i <= 3)
        ? (BaseTrick.random.nextDouble() * 6.0).toInt()
        : (BaseTrick.random.nextDouble() * 10.0).toInt();

    switch (chapterKey) {
      case 'trick44SquareBetween20And29':
        op1 = 20 + temp;
        break;
      case 'trick45SquareBetween30And39':
        op1 = 30 + temp;
        break;
      case 'trick46SquareBetween60And69':
        op1 = 60 + temp;
        break;
      case 'trick47SquareBetween70And79':
        op1 = 70 + temp;
        break;
      case 'trick48SquareBetween80And89':
        op1 = 80 + temp;
        break;
      default:
        op1 = 20 + temp;
    }

    op2 = 2;
    answer = op1 * op1;

    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick44SquareBetween20And29':
        op1 = 24;
        break;
      case 'trick45SquareBetween30And39':
        op1 = 36;
        break;
      case 'trick46SquareBetween60And69':
        op1 = 64;
        break;
      case 'trick47SquareBetween70And79':
        op1 = 72;
        break;
      case 'trick48SquareBetween80And89':
        op1 = 86;
        break;
      default:
        op1 = 24;
    }
    op2 = 2;
    answer = op1 * op1;
    questionText = '$op1²';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int iVar = 0;
    switch (chapterKey) {
      case 'trick44SquareBetween20And29':
        iVar = 40;
        break;
      case 'trick45SquareBetween30And39':
        iVar = 60;
        break;
      case 'trick46SquareBetween60And69':
        iVar = 120;
        break;
      case 'trick47SquareBetween70And79':
        iVar = 140;
        break;
      case 'trick48SquareBetween80And89':
        iVar = 160;
        break;
      default:
        iVar = 0;
    }

    final int temp1 = op1 % 10;
    final int temp3 = temp1 * temp1;
    final int temp4 = op1 ~/ 10;
    final int temp5 = temp4 * 10;
    final int temp6 = temp5 * temp5;
    final int temp7 = temp1 * iVar;
    final int temp8 = temp6 + temp7;

    String steps = "";

    // Step 1: Explain tens split
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick44.step1(op1: op1.toString(), tens: temp5.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${equal()}${spanColor(temp5, 'blue')}${plus()}${spanColor(temp1, 'green')}",
    );

    // Step 2: Square tens
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick44.step2(tens: temp5.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp5, 'blue')}²${equal()}${spanColor(temp6, 'yellow')}",
    );

    // Step 3: Multiply units by iVar
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick44.step3(units: temp1.toString(), multiplier: iVar.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'green')}${times()}${spanColor(iVar, 'orange')}${equal()}${spanColor(temp7, 'cyan')}",
    );

    // Step 4: Square units
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.trick44.step4(units: temp1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'green')}²${equal()}${spanColor(temp3, 'magenta')}",
    );

    // Step 5: Add step 2 and step 3
    steps += createStepLabel(
      stepNo: 5,
      text: l10n.math_tricks.trick44.step5,
    );
    steps += createStepValue(
      text:
          "${spanColor(temp6, 'yellow')}${plus()}${spanColor(temp7, 'cyan')}${equal()}${spanColor(temp8, 'blue')}",
    );

    // Step 6: Add step 4 and step 5
    steps += createStepLabel(
      stepNo: 6,
      text: l10n.math_tricks.trick44.step6,
    );
    steps += createStepValue(
      text:
          "${spanColor(temp8, 'blue')}${plus()}${spanColor(temp3, 'magenta')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1²',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1² = $answer'),
    );
  }
}
