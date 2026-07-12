import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../models/model_number.dart';
import '../../solver/clock_steps.dart';
import 'clock_hours_to_minutes.dart';

class ClockElapsedTime extends ClockHoursToMinutes {
  ClockElapsedTime.init(super.chapter, super.mdChapter) : super.init();

  @override
  bool get isLatexQuestion => true;

  @override
  String getQuestionTemplate() {
    switch (padMode) {
      case KeyPadMode.padYesNo:
        return ("\\begin{aligned}\\text{@0} - \\text{@1}\\ = @2\\end{aligned}");
      default:
        return ("\\begin{aligned}\\text{@0} - \\text{@1}\\end{aligned}");
    }
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    ModelNumber modelNumber0 = getChapterNumRange(selectedRangeIndex, 0);

    MyNumber number0 = MyNumber.nextFractions(
      type: KeyDataType.clock,
      myRandom: myRandom,
      minMax: modelNumber0,
    );
    MyNumber number1 = MyNumber.nextFractions(
      type: KeyDataType.clock,
      myRandom: myRandom,
      minMax: modelNumber0,
    );
    number0.toCorrectClockFormat(modelNumber0.getMaxI());
    number1.toCorrectClockFormat(modelNumber0.getMaxI());
    number0.toUniqueClockFormat(number1, modelNumber0.getMaxI());

    numbers = [];
    numbers.add(number0 > number1 ? number0 : number1);
    numbers.add(number0 > number1 ? number1 : number0);

    answer = numbers[0] - numbers[1];
    choices = createChoiceFractions(minMax: modelNumber0);
    for (var choice in choices) {
      choice.setText(
        choice.value.toClockFormatedText(
          t.math_master.hours_sort_text,
          t.math_master.minutes_sort_text,
        ),
      ); // update text
    }

    for (var choice in choicesBool) {
      choice.setText(
        choice.value.toClockFormatedText(
          t.math_master.hours_sort_text,
          t.math_master.minutes_sort_text,
        ),
      ); // update text
    }
  }

  @override
  String createHtmlQuestion({String? solveTheQuestionText}) {
    String text = steps.divQuestionLabel(text: t.math_master.steps_clock_3);
    text += steps.tex(
      value:
          "${steps.texText(value: numbers[0].toString())}-${steps.texText(value: numbers[1].toString())}",
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
    steps = ClockSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.solution = steps.htmlElapsedTime();
  }
}
