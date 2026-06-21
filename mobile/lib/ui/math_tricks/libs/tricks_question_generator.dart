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
import '../tricks/multiplication/trick60_multiply_by_6.dart';
import '../tricks/multiplication/trick66_multiply_by_16.dart';
import '../tricks/multiplication/trick68_multiply_by_18.dart';
import '../tricks/multiplication/trick95_multiply_by_750.dart';
import '../tricks/percent/trick50_percent_25.dart';
import '../tricks/percent/trick52_percent_15.dart';
import '../tricks/percent/trick55_percent_2.dart';
import '../tricks/percent/trick56_percent_05.dart';
import '../tricks/percent/trick57_percent_150.dart';
import '../tricks/percent/trick58_percent_200.dart';
import '../tricks/percent/trick107_percent_40.dart';
import '../tricks/percent/trick106_percent_750.dart';
import '../tricks/division/trick10_divide_by_5.dart';
import '../tricks/division/trick28_divide_by_4.dart';
import '../tricks/division/trick38_divide_by_05.dart';
import '../tricks/division/trick71_divide_by_15.dart';
import '../tricks/division/trick88_divide_by_8.dart';
import '../tricks/square/trick06_square_ending_in_5.dart';
import '../tricks/square/trick102_square_ending_in_05.dart';
import '../tricks/square/trick103_square_ending_in_15.dart';
import '../tricks/square/trick104_square_ending_in_95.dart';
import '../tricks/square/trick17_square_between_90_and_99.dart';
import '../tricks/square/trick19_square_between_50_and_59.dart';
import '../tricks/square/trick32_square_between_10_and_19.dart';
import '../tricks/square/trick44_48_square_between_20_and_89.dart';
import '../tricks/square/trick39_square_ending_in_25.dart';
import '../tricks/square/trick91_square_ending_in_75.dart';
import '../tricks/square/trick92_square_ending_in_125.dart';

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
      case 'trick60MultiplyBy6':
      case 'trick61MultiplyBy7':
        return Trick60MultiplyBy6(level, chapterKey: chapterKey);
      case 'trick66MultiplyBy16':
      case 'trick67MultiplyBy17':
        return Trick66MultiplyBy16(level, chapterKey: chapterKey);
      case 'trick62MultiplyBy8':
      case 'trick68MultiplyBy18':
      case 'trick69MultiplyBy19':
        return Trick68MultiplyBy18(level, chapterKey: chapterKey);
      case 'trick95MultiplyBy750':
      case 'trick101MultiplyBy75':
        return Trick95MultiplyBy750(level, chapterKey: chapterKey);
      case 'trick50Percent25':
      case 'trick49Percent50':
        return Trick50Percent25(level, chapterKey: chapterKey);
      case 'trick52Percent15':
        return Trick52Percent15(level, chapterKey: chapterKey);
      case 'trick55Percent2':
      case 'trick54Percent4':
      case 'trick51Percent20':
        return Trick55Percent2(level, chapterKey: chapterKey);
      case 'trick56Percent05':
      case 'trick53Percent5':
        return Trick56Percent05(level, chapterKey: chapterKey);
      case 'trick57Percent150':
        return Trick57Percent150(level, chapterKey: chapterKey);
      case 'trick58Percent200':
      case 'trick99Percent300':
      case 'trick100Percent500':
        return Trick58Percent200(level, chapterKey: chapterKey);
      case 'trick107Percent40':
      case 'trick105Percent75':
      case 'trick70Percent250':
        return Trick107Percent40(level, chapterKey: chapterKey);
      case 'trick106Percent750':
        return Trick106Percent750(level, chapterKey: chapterKey);
      case 'trick10DivideBy5':
      case 'trick30DivideBy50':
      case 'trick31DivideBy25':
      case 'trick41DivideBy02':
        return Trick10DivideBy5(level, chapterKey: chapterKey);
      case 'trick28DivideBy4':
      case 'trick29DivideBy20':
      case 'trick36DivideBy40':
      case 'trick72DivideBy6':
      case 'trick98DivideBy9':
        return Trick28DivideBy4(level, chapterKey: chapterKey);
      case 'trick38DivideBy05':
      case 'trick43DivideBy025':
        return Trick38DivideBy05(level, chapterKey: chapterKey);
      case 'trick71DivideBy15':
        return Trick71DivideBy15(level, chapterKey: chapterKey);
      case 'trick88DivideBy8':
        return Trick88DivideBy8(level, chapterKey: chapterKey);
      case 'trick06SquareEndingIn5':
        return Trick06SquareEndingIn5(level);
      case 'trick102SquareEndingIn05':
        return Trick102SquareEndingIn05(level);
      case 'trick103SquareEndingIn15':
        return Trick103SquareEndingIn15(level);
      case 'trick104SquareEndingIn95':
        return Trick104SquareEndingIn95(level);
      case 'trick17SquareBetween90And99':
      case 'trick23SquareBetween100And109':
        return Trick17SquareBetween90And99(level, chapterKey: chapterKey);
      case 'trick19SquareBetween50And59':
      case 'trick20SquareBetween40And49':
        return Trick19SquareBetween50And59(level, chapterKey: chapterKey);
      case 'trick32SquareBetween10And19':
        return Trick32SquareBetween10And19(level);
      case 'trick44SquareBetween20And29':
      case 'trick45SquareBetween30And39':
      case 'trick46SquareBetween60And69':
      case 'trick47SquareBetween70And79':
      case 'trick48SquareBetween80And89':
        return Trick44To48SquareBetween20And89(level, chapterKey: chapterKey);
      case 'trick39SquareEndingIn25':
        return Trick39SquareEndingIn25(level);
      case 'trick91SquareEndingIn75':
        return Trick91SquareEndingIn75(level);
      case 'trick92SquareEndingIn125':
        return Trick92SquareEndingIn125(level);
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
