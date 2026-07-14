import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/cl_mm_chapter.dart';
import '../../models/model_chapter.dart';
import '../../models/my_number.dart';
import '../../models/model_question.dart';
import '../../models/model_solution.dart';
import '../../models/model_number.dart';
import '../../base/base_mm_chapter.dart';
import '../../solver/fraction_steps.dart';

class FractionsSimplestForm extends BaseMmChapter {
  FractionsSimplestForm.init(ClMmChapter chapter, ModelChapter mdChapter) {
    init(chapter, mdChapter);
  }

  @override
  String getQuestionTemplate() {
    switch (padMode) {
      case KeyPadMode.padYesNo:
        return ("@0 = @1");
      default:
        return ("@0");
    }
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();

    ModelNumber modelNumber0 = getChapterNumRange(selectedRangeIndex, 0);
    MyNumber number0 = MyNumber.nextFractions(myRandom: myRandom, minMax: modelNumber0);

    MyNumber numberMult = MyNumber.nextInt(myRandom: myRandom, minMax: getChapterNumRange(selectedRangeIndex, 1));
    number0.numerator *= numberMult.getValI();
    number0.denominator *= numberMult.getValI();

    numbers = [];
    numbers.add(number0);
    answer = MyNumber.clone(number0);
    choices = createChoiceFractions(simplify: true, minMax: modelNumber0);
  }

  @override
  bool get isLatexQuestion => true;

  @override
  ModelQuestion newQuestion({required KeyPadMode padMode, bool resetData = true}) {
    this.padMode = padMode;
    if (resetData) {
      createDataValue(padMode);
    }
    String question = getQuestionTemplate();

    switch (padMode) {
      case KeyPadMode.padYesNo:
        question = createQuestionInRowInt(question: question, data: numbers, lastSymbol: choicesBool[1].getText());
        break;
      default:
        question = createQuestionInRowInt(question: question, data: numbers, lastSymbol: "..");
        break;
    }
    return (ModelQuestion(
        question: question,
        choices: choices,
        choicesBool: choicesBool,
        hasSolution: mdChapter.hasSolution,
        solution: ModelSolution(),
        isLatex: isLatexQuestion));
  }

  late FractionSteps steps;

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(text: t.math_master.steps_fractions_1);
    text += steps.tex(value: numbers[0].toString());
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
    steps = FractionSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.solution = steps.htmlSimplestForm();
  }
}
