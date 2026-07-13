import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../models/model_number.dart';
import '../../solver/clock_steps.dart';
import 'clock_minutes_to_hours.dart';

class ClockHoursToMinutes extends ClockMinutesToHours {
  ClockHoursToMinutes.init(super.chapter, super.mdChapter) : super.init();

  @override
  bool get isLatexQuestion => true;

  @override
  String getQuestionTemplate() {
    switch (padMode) {
      case KeyPadMode.padYesNo:
        return ("\\begin{gathered}@0 \\text{ ${t.math_master.hours_sort_text} } \\\\ = \\\\ @1 \\text{ ${t.math_master.minutes_sort_text} }\\end{gathered}");
      default:
        return ("\\begin{gathered}@0 \\text{ ${t.math_master.hours_sort_text} } \\\\ = \\\\ \\ldots \\text{ ${t.math_master.minutes_sort_text} }\\end{gathered}");
    }
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    ModelNumber modelNumber0 = getChapterNumRange(selectedRangeIndex, 0);
    numbers = [];
    MyNumber number0 = MyNumber.nextFractions(
      type: KeyDataType.hours,
      myRandom: myRandom,
      minMax: modelNumber0,
    );
    number0.toSimplify();
    numbers.add(number0);

    answer = MyNumber.clone(number0);
    choices = createChoiceFractions(simplify: true, minMax: modelNumber0);
    for (var choice in choices) {
      choice.value.hoursToMinutes(); // convert to minutes
      choice.updateText(); // update text
    }

    // update only text, the value updated from *choices* loops
    for (var choice in choicesBool) {
      choice.updateText(); // update text
    }
  }

  @override
  String createHtmlQuestion({String? solveTheQuestionText}) {
    String text = steps.divQuestionLabel(text: t.math_master.steps_clock_1);
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
    steps = ClockSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.solution = steps.htmlHoursToMinutes();
  }
}
