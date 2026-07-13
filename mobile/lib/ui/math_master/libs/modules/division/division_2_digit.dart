import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../models/model_number.dart';
import '../../models/model_solution.dart';
import '../../solver/calc_division_steps.dart';
import 'division_1_digit.dart';
import 'package:bse/i18n/strings.g.dart';

class Division2Digit extends Division1Digit {
  Division2Digit.init(super.chapter, super.mdChapter) : super.init();

  @override
  bool get isLatexQuestion => true;

  @override
  String getQuestionTemplate() {
    switch (padMode) {
      case KeyPadMode.padYesNo:
        return ("\\begin{array}{r} \\underline{\\phantom{\\tiny.}\\phantom{@P0}@2\\phantom{0}}\\\\[-0.25em] @1\\Large/ \\normalsize{@0}\\phantom{0} \\end{array}");
      default:
        return ("\\begin{array}{r} \\underline{\\phantom{\\tiny.}\\phantom{@2}\\phantom{@0}}\\\\[-0.25em] @1\\Large/ \\normalsize{@0}\\phantom{@2} \\end{array}");
    }
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    MyNumber number1 = MyNumber.nextInt(
      myRandom: myRandom,
      minMax: getChapterNumRange(selectedRangeIndex, 1),
    ); // get denominator data

    // create bottom and top range answer
    ModelNumber modelNumber0 = getChapterNumRange(
      selectedRangeIndex,
      0,
    ); // get numerator object info
    int bottomLimit = modelNumber0.min ~/ number1.getValue();
    int topLimit = modelNumber0.max ~/ number1.getValue();
    answer = MyNumber.nextInt(
      myRandom: myRandom,
      minMax: ModelNumber(min: bottomLimit, max: topLimit),
    );

    // get numerator value
    MyNumber number0 = answer * number1;

    numbers = [];
    numbers.add(number0);
    numbers.add(number1);

    choices = createChoiceInteger();
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
        question = createQuestionInLongDivInt(
          question: question,
          data: numbers,
          lastSymbol: choicesBool[1].getText(),
        );
        break;
      default:
        question = createQuestionInLongDivInt(
          question: question,
          data: numbers,
          lastSymbol: ".",
        );
        break;
    }
    return (ModelQuestion(
      question: question,
      choices: choices,
      choicesBool: choicesBool,
      hasSolution: mdChapter.hasSolution,
      solution: ModelSolution(),
    ));
  }

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
    question.solution.solution = divSteps.htmlDivisionDigitsSteps();
  }
}
