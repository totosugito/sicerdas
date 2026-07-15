import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../models/model_number.dart';
import 'percents_from_fractions.dart';
import '../../solver/percent_steps.dart';

class PercentsToFractions extends PercentsFromFractions {
  PercentsToFractions.init(super.chapter, super.mdChapter) : super.init();

  @override
  String getQuestionTemplate() {
    switch (padMode) {
      case KeyPadMode.padYesNo:
        return ("@0\\% = @1");
      default:
        return ("@0\\%");
    }
  }

  @override
  void createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();

    ModelNumber number0 = getChapterNumRange(selectedRangeIndex, 0);
    answer = MyNumber.nextFractions(myRandom: myRandom, minMax: number0);
    numbers = [];
    numbers.add(MyNumber(value: answer.getValueAsPercents().toDouble()));

    answer.toSimplify();
    choices = createChoiceFractions(minMax: number0, simplify: true);
  }

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(text: t.math_master.steps_percents_2);
    text += steps.tex(value: numbers[0].toString() + steps.texPercent());
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
    question.solution.solution = steps.htmlPercentsToFractions();
  }
}
