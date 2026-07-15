import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/cl_mm_chapter.dart';
import '../../models/model_chapter.dart';
import '../../models/model_question.dart';
import '../../models/model_solution.dart';
import '../../models/my_number.dart';
import '../../base/base_mm_chapter.dart';
import '../../solver/roman_lib.dart';
import '../../solver/roman_steps.dart';

class RomanNumberToRoman extends BaseMmChapter {
  late RomanLib romanLib;

  @override
  bool get isLatexQuestion => true;

  RomanNumberToRoman.init(ClMmChapter chapter, ModelChapter mdChapter) {
    init(chapter, mdChapter);
    romanLib = RomanLib();
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
  void createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    numbers = [];
    numbers.add(MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 0)));
    answer = MyNumber.clone(numbers[0]);
    choices = createChoiceRomanNumeral(romanLib: romanLib);
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
            lastSymbol: choicesBool[1].getText());
        break;
      default:
        question = createQuestionInRowInt(
            question: question, data: numbers, lastSymbol: "..");
        break;
    }
    return (ModelQuestion(
        question: question,
        hasSolution: mdChapter.hasSolution,
        choices: choices,
        choicesBool: choicesBool,
        isLatex: isLatexQuestion,
        solution: ModelSolution()));
  }

  late RomanSteps steps;

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(text: t.math_master.steps_roman_1);
    text += numbers[0].getValI().toString();
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
    steps = RomanSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.solution = steps.htmlNumberToRoman();
  }
}
