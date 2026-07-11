import '../../models/my_number.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../solver/calc_addition_steps.dart';
import 'package:bse/i18n/strings.g.dart';
import 'addition_2_digit.dart';

class Addition3Number extends Addition2Digit {
  Addition3Number.init(
    super.chapter,
    super.mdChapter,
  ) : super.init();

  @override
  String getQuestionTemplate() {
    return ("\\begin{aligned} @0 \\\\[-0.5em] @1 \\\\[-0.5em] \\underline{@2} &\\space \\tiny{_+}\\\\[-0.5em] @3 \\end{aligned}");
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
    numbers.add(
      MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 2),
      ),
    );
    answer = numbers[0] + numbers[1] + numbers[2];
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
