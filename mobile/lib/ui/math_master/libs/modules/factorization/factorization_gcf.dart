import '../../models/enums.dart';
import '../../models/cl_mm_chapter.dart';
import '../../models/model_chapter.dart';
import '../../models/my_number.dart';
import '../../models/model_question.dart';
import '../../models/model_solution.dart';
import '../../models/model_number.dart';
import '../../base/base_mm_chapter.dart';
import '../../solver/factorization_lib.dart';
import '../../solver/factorization_steps.dart';
import 'package:bse/i18n/strings.g.dart';

class FactorizationGcf extends BaseMmChapter {
  int chapterRangeLength = 0;
  late FactorizationLib factorizationLib;

  FactorizationGcf.init(ClMmChapter chapter, ModelChapter mdChapter) {
    init(chapter, mdChapter);
    factorizationLib = FactorizationLib();
  }

  @override
  String getQuestionTemplate() {
    String sstr = chapterRangeLength > 3
        ? sprintf("(@0, @1, @2)", [])
        : sprintf("(@0, @1)", []);
    String sstranswer = chapterRangeLength > 3 ? " = @3" : " = @2";
    sstr = sprintf("\\text{%s} %s", [t.math_master.chapter_factorization_gcf, sstr]);
    switch (padMode) {
      case KeyPadMode.padYesNo:
        sstr = sprintf("%s%s", [sstr, sstranswer]);
        break;
      default:
        break;
    }
    return (sprintf("\\begin{gathered} %s \\end{gathered}", [sstr]));
  }

  int computeFactorization() {
    return (factorizationLib.fastGcf(numbers));
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    chapterRangeLength = mdChapter.ranges[selectedRangeIndex].numRanges.length;

    ModelNumber mn0 = getChapterNumRange(selectedRangeIndex, 0);
    ModelNumber mn1 = getChapterNumRange(selectedRangeIndex, 1);
    ModelNumber mn2 = getChapterNumRange(selectedRangeIndex, 2);
    ModelNumber mnm = getChapterNumRange(selectedRangeIndex, chapterRangeLength - 1);

    int val0 = myRandom.nextInt(min: mn0.getMinI(), max: mn0.getMaxI());
    int mult0 = myRandom.nextInt(min: mn1.getMinI(), max: mn1.getMaxI());
    int mult1 = myRandom.nextInt(min: mn2.getMinI(), max: mn2.getMaxI());
    int mult2 = myRandom.nextInt(min: mnm.getMinI(), max: mnm.getMaxI());

    // must unique
    List<int> ids = [mult0, mult1, mult2];
    var distinctIds = ids.toSet().toList();
    distinctIds.sort();
    int nDistinctIds = distinctIds.length;
    int idx = 1;
    for (int i = nDistinctIds - 1; i < 2; i++) {
      distinctIds.add(distinctIds[nDistinctIds - 1] + idx);
      idx += 1;
    }

    numbers = [];
    numbers.add(MyNumber(value: val0 * distinctIds[0]));
    numbers.add(MyNumber(value: val0 * distinctIds[1]));
    if (chapterRangeLength > 3) {
      numbers.add(MyNumber(value: val0 * distinctIds[2]));
    }

    answer = MyNumber(value: computeFactorization());
    choices = createChoiceInteger();
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
        solution: ModelSolution()));
  }

  late FactorizationSteps steps;

  @override
  String createHtmlQuestion({String? solveTheQuestionText}) {
    String numbersText = steps.listNumbersIntToString(
        data: numbers, lastSeparator: sprintf("%s ", [","]));
    String text = sprintf("%s (%s)", [t.math_master.chapter_factorization_gcf, numbersText]);
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
    steps = FactorizationSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.solution = steps.toHtmlGcf();
  }
}
