import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../solver/libs/roman_lib.dart';
import '../../solver/roman_steps.dart';
import 'roman_number_to_roman.dart';

class RomanRomanToNumber extends RomanNumberToRoman {
  RomanRomanToNumber.init(super.chapter, super.mdChapter) : super.init();

  @override
  void createDataValue(KeyPadMode padMode) {
    LibRoman libRoman = LibRoman();

    int selectedRangeIndex = getSelectedRangeIndex();
    numbers = [];
    MyNumber val0 = MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 0));
    answer = MyNumber.clone(val0);
    val0.setRomanText(libRoman); // set roman string

    numbers.add(val0);
    choices = createChoiceInteger();
  }

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(text: t.math_master.steps_roman_5);
    text += steps.tex(value: numbers[0].toString());
    return (text);
  }

  @override
  void updateSolution(
    ModelQuestion question, {
    required String solutionText,
    String? solveTheQuestionText,
    String? stepsAdditionTables,
    String? stepsThereforeResult,
  }) {
    steps = RomanSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.solution = steps.htmlRomanToNumber();
  }
}
