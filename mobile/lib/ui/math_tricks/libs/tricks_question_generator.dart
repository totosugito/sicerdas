import 'package:flutter/material.dart';
import 'widgets/keypad_mode.dart';
import '../tricks/base_trick.dart';
import '../tricks/addition/trick14_add_close_to_100.dart';
import '../tricks/subtraction/trick11_subtraction_from_1000.dart';
import '../tricks/subtraction/trick15_subtraction_close_to_100.dart';
import '../tricks/multiplication/trick16_multiply_between_11_and_19.dart';
import '../tricks/multiplication/trick18_multiply_two_digit_sum_ten.dart';
import '../tricks/multiplication/trick21_multiply_two_digit_ending_in_1.dart';
import '../tricks/multiplication/trick07_multiply_by_5.dart';
import '../tricks/multiplication/trick08_multiply_by_9.dart';
import '../tricks/multiplication/trick09_multiply_by_4.dart';
import '../tricks/multiplication/trick26_multiply_by_15.dart';
import '../tricks/multiplication/trick37_multiply_by_05.dart';
import '../tricks/multiplication/trick59_multiply_by_3.dart';

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
  static BaseTrick _getTrickInstance(String chapterKey, int level) {
    switch (chapterKey) {
      case 'trick14AddCloseTo100':
        return Trick14AddCloseTo100(level);
      case 'trick11SubtractFrom1000':
        return Trick11SubtractionFrom1000(level);
      case 'trick15SubtractingCloseToHundreds':
        return Trick15SubtractionCloseTo100(level);
      case 'trick16MultiplyBetween11And19':
        return Trick16MultiplyBetween11And19(level);
      case 'trick18MultiplyTwoDigitSumTen':
        return Trick18MultiplyTwoDigitSumTen(level);
      case 'trick21MultiplyTwoDigitEndingIn1':
        return Trick21MultiplyTwoDigitEndingIn1(level);
      case 'trick07MultiplyBy5':
      case 'trick34MultiplyBy25':
      case 'trick35MultiplyBy50':
      case 'trick40MultiplyBy02':
      case 'trick90MultiplyBy125':
      case 'trick93MultiplyBy250':
      case 'trick94MultiplyBy500':
        return Trick07MultiplyBy5(level, chapterKey: chapterKey);
      case 'trick08MultiplyBy9':
      case 'trick33MultiplyBy99':
      case 'trick96MultiplyBy999':
        return Trick08MultiplyBy9(level, chapterKey: chapterKey);
      case 'trick09MultiplyBy4':
      case 'trick27MultiplyBy20':
        return Trick09MultiplyBy4(level, chapterKey: chapterKey);
      case 'trick26MultiplyBy15':
        return Trick26MultiplyBy15(level);
      case 'trick37MultiplyBy05':
      case 'trick42MultiplyBy025':
        return Trick37MultiplyBy05(level, chapterKey: chapterKey);
      case 'trick59MultiplyBy3':
      case 'trick63MultiplyBy12':
      case 'trick64MultiplyBy13':
      case 'trick65MultiplyBy14':
      case 'trick05MultiplyTwoDigitBy11':
        return Trick59MultiplyBy3(level, chapterKey: chapterKey);
      default:
        throw UnimplementedError('Trick "$chapterKey" is under development and not yet registered.');
    }
  }

  static GeneratedQuestion generate(String chapterKey, int level) {
    return _getTrickInstance(chapterKey, level).generate();
  }

  static GeneratedQuestion generateDemo(String chapterKey) {
    return _getTrickInstance(chapterKey, 1).generateDemo();
  }
}
