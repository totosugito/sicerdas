import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../solver/libs/roman_lib.dart';
import '../../solver/roman_steps.dart';
import 'roman_addition.dart';

class RomanSubtraction extends RomanAddition {
  RomanSubtraction.init(super.chapter, super.mdChapter) : super.init();

  @override
  String getQuestionTemplate() {
    if (isOneDigit()) {
      switch (padMode) {
        case KeyPadMode.padYesNo:
          return ("@0 - @1 = @2");
        default:
          return ("@0 - @1");
      }
    } else {
      return ("\\begin{array}{r} @0\\space\\phantom{-}\\\\ @1 \\space {-}\\\\ \\hline @2\\space\\phantom{+}\\end{array}");
    }
  }

  @override
  void createDataValue(KeyPadMode padMode) {
    LibRoman libRoman = LibRoman();

    int selectedRangeIndex = getSelectedRangeIndex();
    MyNumber val0 = MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 0));
    MyNumber val1 = MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 1));
    numbers = [];
    numbers.add(val0 > val1 ? val0 : val1);
    numbers.add(val0 > val1 ? val1 : val0);
    answer = numbers[0] - numbers[1];
    val0.setRomanText(libRoman); // set roman string
    val1.setRomanText(libRoman); // set roman string

    choices = createChoiceInteger();
  }

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(
        text: t.math_master.solver.solve_the_question);
    text += steps.tex(
        value: numbers[0].toString() + steps.minus() + numbers[1].toString());
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
    question.solution.solution = steps.htmlRomanCalc(true);
  }
}
