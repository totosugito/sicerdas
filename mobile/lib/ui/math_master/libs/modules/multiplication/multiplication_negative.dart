import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../models/model_solution.dart';
import '../../solver/calc_multiplication_steps.dart';
import '../addition/addition_negative.dart';
import 'package:bse/i18n/strings.g.dart';

class MultiplicationNegative extends AdditionNegative {
  MultiplicationNegative.init(super.chapter, super.mdChapter) : super.init();

  @override
  bool get isLatexQuestion => true;

  @override
  String getQuestionTemplate() {
    if (isOneDigit()) {
      String question = numbers[1].isNegative()
          ? "@0 \\times (@1)"
          : "@0 \\times @1";
      switch (padMode) {
        case KeyPadMode.padYesNo:
          return ("$question = @2");
        default:
          return (question);
      }
    } else {
      return ("\\begin{aligned} @0 \\\\[-0.5em] \\underline{@1} &\\space {_\\times}\\\\[-0.5em] @2 \\end{aligned}");
    }
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    MyNumber val0 = MyNumber.nextInt(
      myRandom: myRandom,
      minMax: getChapterNumRange(selectedRangeIndex, 0),
    );
    MyNumber val1 = MyNumber.nextInt(
      myRandom: myRandom,
      minMax: getChapterNumRange(selectedRangeIndex, 1),
    );

    numbers = [];
    numbers.add(val0);
    numbers.add(val1);
    answer = numbers[0] * numbers[1];
    choices = createChoiceInteger();
  }

  late CalcMultiplicationSteps mulSteps;

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
          lastSymbol: '${choicesBool[1].getText()} ',
        );
      default:
        if (isOneDigit()) {
          String q = createQuestionInRowInt(
            question: question,
            data: numbers,
            lastSymbol: "..",
          );
          return ModelQuestion(
            question: q,
            hasSolution: mdChapter.hasSolution,
            choices: choices,
            choicesBool: choicesBool,
            solution: ModelSolution(),
            isLatex: isLatexQuestion,
          );
        } else {
          return createQuestionWithHorzLineInt(
            question: question,
            data: numbers,
            lastSymbol: "..",
          );
        }
    }
  }

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
    question.solution.solution = mulSteps.htmlMultiplicationDigitsSteps();
  }
}
