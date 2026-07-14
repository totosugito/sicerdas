import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../base/base_mm_chapter.dart';
import '../../solver/factorization_steps.dart';
import 'factorization_gcf.dart';
import 'package:bse/i18n/strings.g.dart';

class FactorizationLcm extends FactorizationGcf {
  FactorizationLcm.init(super.chapter, super.mdChapter) : super.init();

  @override
  String getQuestionTemplate() {
    String sstr = chapterRangeLength > 3
        ? sprintf("(@0, @1, @2)", [])
        : sprintf("(@0, @1)", []);
    String sstranswer = chapterRangeLength > 3 ? " = @3" : " = @2";
    sstr = sprintf("\\text{%s} %s", [
      t.math_master.chapter_factorization_lcm_short,
      sstr,
    ]);
    switch (padMode) {
      case KeyPadMode.padYesNo:
        sstr = sprintf("%s%s", [sstr, sstranswer]);
        break;
      default:
        break;
    }
    return (sprintf("\\begin{gathered} %s \\end{gathered}", [sstr]));
  }

  @override
  int computeFactorization() {
    return (factorizationLib.fastLcm(numbers));
  }

  @override
  String createHtmlQuestion({String? solveTheQuestionText}) {
    String numbersText = steps.listNumbersIntToString(
      data: numbers,
      lastSeparator: sprintf("%s ", [","]),
    );
    String text = sprintf("%s (%s)", [
      t.math_master.chapter_factorization_lcm_short,
      numbersText,
    ]);
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
    question.solution.solution = steps.toHtmlLcm();
  }
}
