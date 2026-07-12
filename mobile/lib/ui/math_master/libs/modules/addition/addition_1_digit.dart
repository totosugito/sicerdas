import '../../base/base_mm_chapter.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/cl_mm_chapter.dart';
import '../../models/model_chapter.dart';
import '../../models/my_number.dart';
import '../../models/model_solution.dart';
import '../../solver/calc_addition_steps.dart';
import 'package:bse/i18n/strings.g.dart';

class Addition1Digit extends BaseMmChapter {
  Addition1Digit.init(ClMmChapter chapter, ModelChapter mdChapter) {
    init(chapter, mdChapter);
  }

  @override
  String getQuestionTemplate() {
    switch (padMode) {
      case KeyPadMode.padYesNo:
        return ("@0 + @1 = @2");
      default:
        return ("@0 + @1");
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
    answer = numbers[0] + numbers[1];
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
        question = createQuestionInRowInt(
          question: question,
          data: numbers,
          lastSymbol: '${choicesBool[1].getText()} ',
        );
        break;
      default:
        question = createQuestionInRowInt(
          question: question,
          data: numbers,
          lastSymbol: "..",
        );
        break;
    }
    return (ModelQuestion(
      question: question,
      hasSolution: mdChapter.hasSolution,
      choices: choices,
      choicesBool: choicesBool,
      solution: ModelSolution(),
      isLatex: isLatexQuestion,
    ));
  }

  late CalcAdditionSteps addSteps;

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
    question.solution.solution = addSteps.htmlAddition1Digit(
      stepsAdditionTables:
          stepsAdditionTables ?? t.math_master.solver.addition_tables,
      stepsThereforeResult:
          stepsThereforeResult ?? t.math_master.solver.therefore_result,
    );
  }
}
