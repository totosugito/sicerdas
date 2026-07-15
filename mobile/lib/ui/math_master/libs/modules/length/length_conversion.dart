import 'dart:math';
import 'package:bse/i18n/strings.g.dart';

import '../../models/enums.dart';
import '../../models/cl_mm_chapter.dart';
import '../../models/model_chapter.dart';
import '../../models/model_question.dart';
import '../../models/model_solution.dart';
import '../../models/my_number.dart';
import '../../models/model_number.dart';
import '../../base/base_mm_chapter.dart';
import '../../solver/measurement_lib.dart';
import '../../solver/measurement_steps.dart';

class LengthConversion extends BaseMmChapter {
  late MeasurementLib measurementLib;

  @override
  bool get isLatexQuestion => true;

  void initLibrary() {
    measurementLib = MeasurementLib.initLength();
  }

  LengthConversion.init(ClMmChapter chapter, ModelChapter mdChapter) {
    init(chapter, mdChapter);
    initLibrary();
  }

  @override
  String getQuestionTemplate() {
    return ("\\begin{gathered} @0 \\\\[-0.5em] = \\\\[-0.5em] @1 \\end{gathered}");
  }

  late int unitId0, unitId1, unitId2;

  void createRequirementUnitId(int selectedRangeIndex) {
    // create unit id data range
    int lengthUnits = measurementLib.getUnitLength();
    ModelNumber modelNumber2 = getChapterNumRange(selectedRangeIndex, 2);
    MyNumber unitSpacing = MyNumber.nextInt(
      myRandom: myRandom,
      minMax: modelNumber2,
    );
    int midUnit = myRandom.nextInt(min: 0, max: lengthUnits - 1);
    int leftUnit = midUnit - unitSpacing.getVal().toInt();
    leftUnit = leftUnit < 0 ? 0 : leftUnit;
    int rightUnit = leftUnit + modelNumber2.getMaxI();
    rightUnit = rightUnit >= lengthUnits ? lengthUnits - 1 : rightUnit;

    // create unitId1
    unitId0 = midUnit;
    unitId1 = myRandom.nextBool() ? rightUnit : leftUnit;
    unitId2 = myRandom.nextBool() ? rightUnit : leftUnit;
  }

  @override
  void createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    createRequirementUnitId(selectedRangeIndex);

    ModelNumber modelNumber0 = getChapterNumRange(selectedRangeIndex, 0);
    ModelNumber modelNumber1 = getChapterNumRange(selectedRangeIndex, 1);
    MyNumber number0 = MyNumber.nextInt(
      myRandom: myRandom,
      type: KeyDataType.measurement,
      id: unitId0,
      unit: measurementLib.getUnit(unitId0).getSymbol(),
      minMax: modelNumber0,
    );
    answer = MyNumber(
      id: unitId1,
      unit: measurementLib.getUnit(unitId1).getSymbol(),
      value: 0.0,
      type: KeyDataType.measurement,
    );

    // create number multiplier. So, the input number have many variations
    // ex: 1 --> [1 10 100, ... multiplier],
    int multiplier = myRandom.nextInt(
      min: modelNumber1.getMinI(),
      max: modelNumber1.getMaxI(),
    );
    multiplier = pow(10, multiplier).toInt();

    num multiplier0 = measurementLib.getMultiplierConst(unitId0, unitId1);
    number0.value = (multiplier0 < 1
                ? number0.getVal() / multiplier0
                : number0.getVal() * multiplier0)
            .toInt() *
        multiplier;
    number0.denominator = 0; //no fractions
    answer.value = measurementLib.convertUnit(number0, answer).round();
    answer.denominator = 0; //no fractions

    numbers = [];
    numbers.add(number0);
    choices = createChoiceIntegerMultiplier(baseRank: 10);
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
        MyNumber selectedChoice = MyNumber.clone(choicesBool[1].value);
        selectedChoice.type = KeyDataType.measurement;
        question = createQuestionInRowInt(
          question: question,
          data: numbers,
          lastSymbol: selectedChoice.toString(),
        );
        break;
      default:
        question = createQuestionInRowInt(
          question: question,
          data: numbers,
          lastSymbol: sprintf(
            "\\ldots \\text{%s}",
            [answer.getUnit()],
          ),
        );
        break;
    }
    return (ModelQuestion(
      question: question,
      choices: choices,
      choicesBool: choicesBool,
      hasSolution: mdChapter.hasSolution,
      solution: ModelSolution(),
      isLatex: isLatexQuestion,
    ));
  }

  late MeasurementSteps steps;

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(
      text: t.math_master.solver.solve_the_question,
    );
    text += steps.tex(value: steps.htmlMeasurementConversionQuestion());
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
    question.solution.solution = steps.htmlConversionSteps();
  }
}
