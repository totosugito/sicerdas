import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../models/model_solution.dart';
import '../../solver/calc_addition_steps.dart';
import 'package:bse/i18n/strings.g.dart';
import 'addition_1_digit.dart';

class AdditionMissingDigit extends Addition1Digit {
  AdditionMissingDigit.init(
    super.chapter,
    super.mdChapter,
  ) : super.init();

  @override
  String getQuestionTemplate() {
    return ("");
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
    numbers.add(numbers[0] + numbers[1]);
    createMissingDigitIndex(numbers);
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

    CalcAdditionSteps libSteps = CalcAdditionSteps(
      numbers: numbers,
      answer: answer,
    );
    String question = libSteps.createQuestionMissingDigit(
      idxPos: idxMissingDigit,
      symbol: "+",
    );
    return ModelQuestion(
      question: question,
      hasSolution: mdChapter.hasSolution,
      choices: choices,
      choicesBool: choicesBool,
      solution: ModelSolution(),
    );
  }

  @override
  String createHtmlQuestion({String? solveTheQuestionText}) {
    final String textLabel =
        solveTheQuestionText ?? t.math_master.solver.solve_the_question;
    String text = addSteps.divQuestionLabel(text: textLabel);
    text += addSteps.tex(
      value: addSteps.createQuestionMissingDigit(
        idxPos: idxMissingDigit,
        symbol: "+",
      ),
    );
    return text;
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
    question.solution.solution = addSteps.htmlAdditionMissingDigit(
      idxMissingDigit,
    );
  }
}
