import 'dart:math';
import 'package:bse/i18n/strings.g.dart';

import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/my_number.dart';
import '../../models/model_number.dart';
import '../../solver/measurement_steps.dart';
import 'length_addition.dart';

class LengthSubtraction extends LengthAddition {
  LengthSubtraction.init(super.chapter, super.mdChapter) : super.init();

  @override
  bool get isLatexQuestion => true;

  @override
  String getQuestionTemplate() {
    return ("\\begin{array}{r} @0\\space\\phantom{-}\\\\ @1 \\space {-}\\\\ \\hline @2\\space\\phantom{-}\\end{array}");
  }

  @override
  void createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    createRequirementUnitId(selectedRangeIndex);

    ModelNumber modelNumber0 = getChapterNumRange(selectedRangeIndex, 0);
    ModelNumber modelNumber1 = getChapterNumRange(selectedRangeIndex, 1);

    // create number question
    MyNumber number0 = MyNumber.nextInt(
      myRandom: myRandom,
      type: KeyDataType.measurement,
      id: unitId0,
      unit: measurementLib.getUnit(unitId0).getSymbol(),
      minMax: modelNumber0,
    );
    MyNumber number1 = MyNumber.nextInt(
      myRandom: myRandom,
      type: KeyDataType.measurement,
      id: unitId1,
      unit: measurementLib.getUnit(unitId1).getSymbol(),
      minMax: modelNumber0,
    );
    answer = MyNumber(
      id: unitId2,
      unit: measurementLib.getUnit(unitId2).getSymbol(),
      value: 0.0,
      type: KeyDataType.measurement,
    );

    // create number multiplier. So, the input number have many variations
    // ex: 1 --> [1 10 100, ... multiplier],
    int multVal0 = myRandom.nextInt(
      min: modelNumber1.getMinI(),
      max: modelNumber1.getMaxI(),
    );
    multVal0 = pow(10, multVal0).toInt();
    int multVal1 = myRandom.nextInt(
      min: modelNumber1.getMinI(),
      max: modelNumber1.getMaxI(),
    );
    multVal1 = pow(10, multVal1).toInt();

    // update input value
    num multiplier0 = measurementLib.getMultiplierConst(number0.id, answer.id);
    num multiplier1 = measurementLib.getMultiplierConst(number1.id, answer.id);
    number0.value =
        (multiplier0 < 1
                ? number0.getVal() / multiplier0
                : number0.getVal() * multiplier0)
            .toInt() *
        multVal0;
    number1.value =
        (multiplier1 < 1
                ? number1.getVal() / multiplier1
                : number1.getVal() * multiplier1)
            .toInt() *
        multVal1;

    // get the largest number
    num v0 = measurementLib.convertUnit(number0, answer);
    num v1 = measurementLib.convertUnit(number1, answer);
    numbers = [];
    number0.denominator = 0;
    number1.denominator = 0;
    numbers.add(v0 > v1 ? number0 : number1);
    numbers.add(v0 > v1 ? number1 : number0);

    // set answer value
    num val2 = measurementLib.unitAdd(numbers, [
      KeyCalcMethod.add,
      KeyCalcMethod.sub,
    ], answer);
    answer.value = val2.round();

    // create choices
    choices = createChoiceIntegerMultiplier(baseRank: 10);
  }

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(
      text: t.math_master.solver.solve_the_question,
    );
    text += steps.tex(
      value: steps.htmlMeasurementCalculationQuestion(steps.minus()),
    );
    return (text);
  }

  @override
  updateSolution(
    ModelQuestion question, {
    required String solutionText,
    required String solveTheQuestionText,
    required String stepsAdditionTables,
    required String stepsThereforeResult,
  }) {
    steps = MeasurementSteps(numbers: numbers, answer: answer);
    steps.setLibrary(measurementLib);

    initSolution(question, solutionText: solutionText);
    question.solution.solution = steps.htmlMeasurementCalculationSteps(
      steps.minus(),
    );
  }
}
