import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../solver/calc_subtraction_steps.dart';
import 'subtraction_1_digit.dart';
import 'package:bse/i18n/strings.g.dart';

class Subtraction2Digit extends Subtraction1Digit {
  Subtraction2Digit.init(super.chapter, super.mdChapter) : super.init();

  @override
  bool get isLatexQuestion => true;

  @override
  String getQuestionTemplate() {
    return ("\\begin{aligned} @0 \\\\[-0.5em] \\underline{@1} &\\space {_-}\\\\[-0.5em] @2 \\end{aligned}");
  }

  @override
  ModelQuestion newQuestion({required KeyPadMode padMode, bool resetData = true}) {
    this.padMode = padMode;
    if (resetData) {
      createDataValue(padMode);
    }
    String question = getQuestionTemplate();

    switch (padMode) {
      case KeyPadMode.padYesNo:
        return (createQuestionWithHorzLineInt(question: question, data: numbers, lastSymbol: choicesBool[1].getText()));
      default:
        return (createQuestionWithHorzLineInt(question: question, data: numbers, lastSymbol: ".."));
    }
  }

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
