import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../models/model_solution.dart';
import '../../solver/calc_subtraction_steps.dart';
import '../addition/addition_missing_digit.dart';
import 'package:bse/i18n/strings.g.dart';

class SubtractionMissingDigit extends AdditionMissingDigit {
  SubtractionMissingDigit.init(super.chapter, super.mdChapter) : super.init();

  @override
  bool get isLatexQuestion => true;

  @override
  String getQuestionTemplate() {
    return ("\\begin{aligned} @0 &\\\\[-0.5em] \\underline{@1} &\\space {_-}\\\\[-0.5em] @2 \\\\ \\end{aligned}");
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    MyNumber val0 = MyNumber.nextInt(myRandom: myRandom, minMax: getChapterNumRange(selectedRangeIndex, 0));
    MyNumber val1 = MyNumber.nextInt(myRandom: myRandom, minMax: getChapterNumRange(selectedRangeIndex, 1));

    numbers = [];
    numbers.add(val0 > val1 ? val0 : val1);
    numbers.add(val0 > val1 ? val1 : val0);
    numbers.add(numbers[0] - numbers[1]);

    createMissingDigitIndex(numbers);
  }

  @override
  ModelQuestion newQuestion({required KeyPadMode padMode, bool resetData = true}) {
    this.padMode = padMode;
    if (resetData) {
      createDataValue(padMode);
    }

    CalcSubtractionSteps libSteps = CalcSubtractionSteps(numbers: numbers, answer: answer);
    String question = libSteps.createQuestionSubtractionMissingDigit(idxPos: idxMissingDigit, symbol: "-");
    return (ModelQuestion(
      question: question,
      hasSolution: mdChapter.hasSolution,
      choices: choices,
      choicesBool: choicesBool,
      solution: ModelSolution(),
      isLatex: isLatexQuestion,
    ));
  }

  late CalcSubtractionSteps subSteps;

  @override
  String createHtmlQuestion({String? solveTheQuestionText}) {
    final String textLabel =
        solveTheQuestionText ?? t.math_master.solver.solve_the_question;
    String text = subSteps.divQuestionLabel(text: textLabel);
    text += subSteps.tex(value: subSteps.createQuestionSubtractionMissingDigit(idxPos: idxMissingDigit, symbol: "-"));
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
    question.solution.solution = subSteps.htmlSubtractionMissingDigit(idxMissingDigit);
  }
}
