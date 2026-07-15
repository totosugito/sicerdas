import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/cl_mm_chapter.dart';
import '../../models/model_chapter.dart';
import '../../models/model_question.dart';
import '../../models/model_solution.dart';
import '../../models/my_number.dart';
import '../../models/model_number.dart';
import '../../base/base_mm_chapter.dart';
import '../../solver/percent_steps.dart';

class PercentsOfNumber extends BaseMmChapter {
  @override
  bool get isLatexQuestion => true;

  PercentsOfNumber.init(ClMmChapter chapter, ModelChapter mdChapter) {
    init(chapter, mdChapter);
  }

  @override
  String getQuestionTemplate() {
    switch (padMode) {
      case KeyPadMode.padYesNo:
        return ("\\begin{gathered}@0 \\text{ ${t.math_master.of_text} } @1 \\\\ = \\\\ @2\\end{gathered}");
      default:
        return ("\\begin{gathered}@0 \\text{ ${t.math_master.of_text} } @1\\end{gathered}");
    }
  }

  @override
  void createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();

    ModelNumber numRange0 = getChapterNumRange(selectedRangeIndex, 0);
    numbers = [];
    numbers.add(
      MyNumber.nextInt(
        myRandom: myRandom,
        type: KeyDataType.percents,
        minMax: numRange0,
      ),
    ); // percent number
    numbers.add(
      MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 1),
      ),
    );
    answer = MyNumber(value: (numbers[0] * numbers[1]).getValue() ~/ 100);
    choices = createChoiceIntegerSimple(spacing: numRange0.getSpacingI());
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
        MyNumber selectedChoice = MyNumber.clone(choicesBool[1].value);
        question = createQuestionInRowInt(
          question: question,
          data: numbers,
          lastSymbol: selectedChoice.toString(),
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
      choices: choices,
      choicesBool: choicesBool,
      hasSolution: mdChapter.hasSolution,
      solution: ModelSolution(),
      isLatex: isLatexQuestion,
    ));
  }

  late PercentSteps steps;

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(
      text: t.math_master.solver.solve_the_question,
    );
    text += steps.tex(
      value:
          "${numbers[0].toString()} \\text{ ${t.math_master.of_text} } ${numbers[1].toString()}",
    );
    return (text);
  }

  @override
  void updateSolution(
    ModelQuestion question, {
    required String solutionText,
    String? solveTheQuestionText,
    String? stepsAdditionTables,
    String? stepsThereforeResult,
  }) {
    steps = PercentSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.solution = steps.htmlPercentsOfNumber();
  }
}
