import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../solver/calc_addition_steps.dart';
import 'package:bse/i18n/strings.g.dart';
import 'addition_1_digit.dart';

class Addition2Digit extends Addition1Digit {
  Addition2Digit.init(super.chapter, super.mdChapter) : super.init();

  @override
  bool get isLatexQuestion => true;

  @override
  String getQuestionTemplate() {
    return ("\\begin{aligned} @0 \\\\[-0.5em] \\underline{@1} &\\space \\tiny{_+}\\\\[-0.5em] @2 \\end{aligned}");
  }

  @override
  ModelQuestion newQuestion({
    required KeyPadMode padMode,
    bool resetData = true,
  }) {
    this.padMode = padMode;
    if (resetData) {
      createDataValue(padMode);
    }
    String question = getQuestionTemplate();

    switch (padMode) {
      case KeyPadMode.padYesNo:
        return createQuestionWithHorzLineInt(
          question: question,
          data: numbers,
          lastSymbol: choicesBool[1].getText(),
        );
      default:
        return createQuestionWithHorzLineInt(
          question: question,
          data: numbers,
          lastSymbol: "..",
        );
    }
  }

  @override
  String createHtmlQuestion({String? solveTheQuestionText}) {
    final String textLabel =
        solveTheQuestionText ?? t.math_master.solver.solve_the_question;
    String text = addSteps.divQuestionLabel(text: textLabel);
    text += addSteps.tex(
      value: addSteps.listNumbersIntToString(
        data: numbers,
        separator: addSteps.plus(),
        lastSeparator: addSteps.plus(),
      ),
    );
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
    addSteps = CalcAdditionSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.question = createHtmlQuestion(
      solveTheQuestionText:
          solveTheQuestionText ?? t.math_master.solver.solve_the_question,
    );
    question.solution.solution = addSteps.htmlAddition(
      stepsThereforeResult:
          stepsThereforeResult ?? t.math_master.solver.therefore_result,
    );
  }
}
