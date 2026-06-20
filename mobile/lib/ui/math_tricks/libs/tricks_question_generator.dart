import 'package:flutter/material.dart';
import 'widgets/keypad_mode.dart';
import '../tricks/addition/trick14_add_close_to_100.dart';
import '../tricks/subtraction/trick11_subtraction_from_1000.dart';
import '../tricks/subtraction/trick15_subtraction_close_to_100.dart';
import '../tricks/multiplication/trick16_multiply_between_11_and_19.dart';
import '../tricks/multiplication/trick18_multiply_two_digit_sum_ten.dart';
import '../tricks/multiplication/trick21_multiply_two_digit_ending_in_1.dart';
import '../tricks/multiplication/trick07_multiply_by_5.dart';

class GeneratedQuestion {
  final String questionText;
  final num answer;
  final List<num> choices;
  final String Function(BuildContext context) getSolutionHtml;
  final List<KeyPadMode> supportedKeyPads;

  GeneratedQuestion({
    required this.questionText,
    required this.answer,
    required this.choices,
    required this.getSolutionHtml,
    required this.supportedKeyPads,
  });

  String buildSolutionHtml(BuildContext context) => getSolutionHtml(context);
}

class TricksQuestionGenerator {
  static GeneratedQuestion generate(String chapterKey, int level) {
    switch (chapterKey) {
      case 'trick14AddCloseTo100':
        return Trick14AddCloseTo100(level).generate();
      case 'trick11SubtractFrom1000':
        return Trick11SubtractionFrom1000(level).generate();
      case 'trick15SubtractingCloseToHundreds':
        return Trick15SubtractionCloseTo100(level).generate();
      case 'trick16MultiplyBetween11And19':
        return Trick16MultiplyBetween11And19(level).generate();
      case 'trick18MultiplyTwoDigitSumTen':
        return Trick18MultiplyTwoDigitSumTen(level).generate();
      case 'trick21MultiplyTwoDigitEndingIn1':
        return Trick21MultiplyTwoDigitEndingIn1(level).generate();
      case 'trick07MultiplyBy5':
      case 'trick34MultiplyBy25':
      case 'trick35MultiplyBy50':
      case 'trick40MultiplyBy02':
      case 'trick90MultiplyBy125':
      case 'trick93MultiplyBy250':
      case 'trick94MultiplyBy500':
        return Trick07MultiplyBy5(level, chapterKey: chapterKey).generate();
      default:
        throw UnimplementedError(
          'Trick "$chapterKey" is under development and not yet registered.',
        );
    }
  }
}
