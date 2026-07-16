import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../solver/calc_subtraction_steps.dart';
import '../addition/addition_negative.dart';
import 'package:bse/i18n/strings.g.dart';

class SubtractionNegative extends AdditionNegative {
  SubtractionNegative.init(super.chapter, super.mdChapter) : super.init();

  @override
  String getQuestionTemplate() {
    if (isOneDigit()) {
      String question = numbers[1].isNegative() ? "@0 - (@1)" : "@0 - @1";
      switch (padMode) {
        case KeyPadMode.padYesNo:
          return ("$question = @2");
        default:
          return (question);
      }
    } else {
      return ("\\begin{aligned} @0 \\\\[-0.5em] \\underline{@1} &\\space {_-}\\\\[-0.5em] @2 \\end{aligned}");
    }
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    numbers = [];
    numbers.add(MyNumber.nextInt(myRandom: myRandom, minMax: getChapterNumRange(selectedRangeIndex, 0)));
    numbers.add(MyNumber.nextInt(myRandom: myRandom, minMax: getChapterNumRange(selectedRangeIndex, 1)));
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
    question.solution.solution = subSteps.htmlSubtraction();
  }
}
