import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../solver/calc_multiplication_steps.dart';
import '../addition/addition_1_digit.dart';
import 'package:bse/i18n/strings.g.dart';

class Multiplication1Digit extends Addition1Digit {
  Multiplication1Digit.init(super.chapter, super.mdChapter) : super.init();

  @override
  bool get isLatexQuestion => true;

  @override
  String getQuestionTemplate() {
    switch (padMode) {
      case KeyPadMode.padYesNo:
        return ("@0 \\times @1 = @2");
      default:
        return ("@0 \\times @1");
    }
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    numbers = [];
    numbers.add(
      MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 0),
      ),
    );
    numbers.add(
      MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 1),
      ),
    );
    answer = numbers[0] * numbers[1];
    choices = createChoiceInteger();
  }

  late CalcMultiplicationSteps mulSteps;

  @override
  String createHtmlQuestion({String? solveTheQuestionText}) {
    final String textLabel =
        solveTheQuestionText ?? t.math_master.solver.solve_the_question;
    String text = mulSteps.divQuestionLabel(text: textLabel);
    text += mulSteps.tex(value: mulSteps.htmlMultiplication1DigitQuestion());
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
    mulSteps = CalcMultiplicationSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.question = createHtmlQuestion(
      solveTheQuestionText:
          solveTheQuestionText ?? t.math_master.solver.solve_the_question,
    );
    question.solution.solution = mulSteps.htmlMultiplication1Digit();
  }
}
