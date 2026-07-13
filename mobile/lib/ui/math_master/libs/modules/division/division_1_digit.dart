import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../solver/calc_division_steps.dart';
import '../addition/addition_1_digit.dart';
import 'package:bse/i18n/strings.g.dart';

class Division1Digit extends Addition1Digit {
  Division1Digit.init(super.chapter, super.mdChapter) : super.init();

  @override
  String getQuestionTemplate() {
    switch (padMode) {
      case KeyPadMode.padYesNo:
        return ("@0 : @1 = @2");
      default:
        return ("@0 : @1");
    }
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    numbers = [];
    MyNumber number1 = MyNumber.nextInt(
      myRandom: myRandom,
      minMax: getChapterNumRange(selectedRangeIndex, 0),
    );
    answer = MyNumber.nextInt(
      myRandom: myRandom,
      minMax: getChapterNumRange(selectedRangeIndex, 1),
    );
    MyNumber number0 = number1 * answer;

    numbers.add(number0);
    numbers.add(number1);
    choices = createChoiceInteger(useOneDigit: true);
  }

  late CalcDivisionSteps divSteps;

  @override
  String createHtmlQuestion({String? solveTheQuestionText}) {
    final String textLabel =
        solveTheQuestionText ?? t.math_master.solver.solve_the_question;
    String text = divSteps.divQuestionLabel(text: textLabel);
    text += divSteps.tex(value: divSteps.htmlDivision1DigitQuestion());
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
    divSteps = CalcDivisionSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.question = createHtmlQuestion(
      solveTheQuestionText:
          solveTheQuestionText ?? t.math_master.solver.solve_the_question,
    );
    question.solution.solution = divSteps.htmlDivision1Digit();
  }
}
