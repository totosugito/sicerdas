import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/my_number.dart';
import '../../models/model_question.dart';
import '../../models/model_number.dart';
import '../../solver/fraction_steps.dart';
import 'fractions_simplest_form.dart';

class FractionsFromMixed extends FractionsSimplestForm {
  FractionsFromMixed.init(super.chapter, super.mdChapter)
      : super.init();

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();

    ModelNumber modelNumber0 = getChapterNumRange(selectedRangeIndex, 0);
    MyNumber number0 = MyNumber.nextFractions(myRandom: myRandom, minMax: modelNumber0);

    numbers = [];
    numbers.add(number0);
    answer = MyNumber.clone(number0);
    choices = createChoiceFractions(simplify: true, simpleFraction: true, minMax: modelNumber0);
  }

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(text: t.math_master.steps_fractions_3);
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
    question.solution.solution = steps.htmlFractionsFromMixed();
  }
}
