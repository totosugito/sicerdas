import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../models/model_number.dart';
import 'percents_of_number.dart';
import '../../solver/percent_steps.dart';

class PercentsFromFractions extends PercentsOfNumber {
  PercentsFromFractions.init(super.chapter, super.mdChapter) : super.init();

  @override
  String getQuestionTemplate() {
    return ("@0 = @1\\%");
  }

  @override
  void createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();

    ModelNumber val0 = getChapterNumRange(selectedRangeIndex, 0);
    numbers = [];
    numbers.add(MyNumber.nextFractions(myRandom: myRandom, minMax: val0));
    answer = MyNumber(value: numbers[0].getValueAsPercents());

    int spacingVal = val0.spacingNum * 100 ~/ val0.minDen;
    choices = createChoiceIntegerSimple(spacing: spacingVal);
  }

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(text: t.math_master.steps_percents_1);
    text += steps.tex(value: numbers[0].toString());
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
    question.solution.solution = steps.htmlFractionsToPercents();
  }
}
