import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../solver/calc_subtraction_steps.dart';
import '../addition/addition_1_digit.dart';
import 'package:bse/i18n/strings.g.dart';

class Subtraction1Digit extends Addition1Digit {
  Subtraction1Digit.init(super.chapter, super.mdChapter) : super.init();

  @override
  String getQuestionTemplate() {
    switch (padMode) {
      case KeyPadMode.padYesNo:
        return ("@0 - @1 = @2");
      default:
        return ("@0 - @1");
    }
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    MyNumber val0 = MyNumber.nextInt(myRandom: myRandom, minMax: getChapterNumRange(selectedRangeIndex, 0));
    MyNumber val1 = MyNumber.nextInt(myRandom: myRandom, minMax: getChapterNumRange(selectedRangeIndex, 1));

    numbers = [];
    numbers.add(val0 > val1 ? val0 : val1);
    numbers.add(val0 > val1 ? val1 : val0);
    answer = numbers[0] - numbers[1];
    choices = createChoiceInteger();
  }

  late CalcSubtractionSteps subSteps;

  @override
  String createHtmlQuestion({String? solveTheQuestionText}) {
    final String textLabel =
        solveTheQuestionText ?? t.math_master.solver.solve_the_question;
    String text = subSteps.divQuestionLabel(text: textLabel);
    text += subSteps.tex(value: subSteps.listNumbersIntToString(
        data: numbers, separator: subSteps.minus(), lastSeparator: subSteps.minus()));
    return (text);
  }

  @override
  updateSolution(
    ModelQuestion question, {
    required String solutionText,
    String? solveTheQuestionText,
    String? stepsAdditionTables,
    String? stepsThereforeResult,
  }) {
    subSteps = CalcSubtractionSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.question = createHtmlQuestion(
      solveTheQuestionText:
          solveTheQuestionText ?? t.math_master.solver.solve_the_question,
    );
    question.solution.solution = subSteps.htmlSubtraction1Digit();
  }
}
