import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../solver/calc_multiplication_steps.dart';
import '../addition/addition_2_digit.dart';
import 'package:bse/i18n/strings.g.dart';

class Multiplication2Digit extends Addition2Digit {
  Multiplication2Digit.init(super.chapter, super.mdChapter) : super.init();

  @override
  String getQuestionTemplate() {
    return ("\\begin{aligned} @0 \\\\[-0.5em] \\underline{@1} &\\space {_\\times}\\\\[-0.5em] @2 \\end{aligned}");
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    MyNumber val0 = MyNumber.nextInt(myRandom: myRandom, minMax: getChapterNumRange(selectedRangeIndex, 0));
    MyNumber val1 = MyNumber.nextInt(myRandom: myRandom, minMax: getChapterNumRange(selectedRangeIndex, 1));

    numbers = [];
    numbers.add(val0 > val1 ? val0 : val1);
    numbers.add(val0 > val1 ? val1 : val0);
    answer = numbers[0] * numbers[1];
    choices = createChoiceInteger();
  }

  late CalcMultiplicationSteps mulSteps;

  @override
  String createHtmlQuestion({String? solveTheQuestionText}) {
    final String textLabel =
        solveTheQuestionText ?? t.math_master.solver.solve_the_question;
    String text = mulSteps.divQuestionLabel(text: textLabel);
    text += mulSteps.tex(value: mulSteps.htmlMultiplicationDigitsQuestion());
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
    question.solution.solution = mulSteps.htmlMultiplicationDigitsSteps(showLearnPrevChapter: false);
  }
}
