import 'package:bse/i18n/strings.g.dart';
import 'package:flutter/material.dart';
import '../../models/enums.dart';
import '../../models/my_number.dart';
import '../../models/model_question.dart';
import '../../models/model_number.dart';
import '../../solver/fraction_steps.dart';
import 'fractions_addition.dart';

class FractionsSubtraction extends FractionsAddition {
  FractionsSubtraction.init(super.chapter, super.mdChapter)
      : super.init();

  @override
  String getQuestionTemplate() {
    switch (padMode) {
      case KeyPadMode.padYesNo:
        return ("@0 - @1 = @2");
      default:
        return ("@0 - @1");
    }
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();

    ModelNumber modelNumber0 = getChapterNumRange(selectedRangeIndex, 0);
    MyNumber number0 = MyNumber.nextFractions(myRandom: myRandom, minMax: modelNumber0);
    MyNumber numberx = MyNumber.nextFractions(myRandom: myRandom, minMax: modelNumber0);
    MyNumber number1 = MyNumber.nextFractionUnique(rawList: [number0], checkNumber: numberx); // must unique
    number0.toSimplify();
    number1.toSimplify();

    numbers = [];
    numbers.add(number0 > number1 ? number0 : number1);
    numbers.add(number0 < number1 ? number0 : number1);
    answer = numbers[0] - numbers[1];
    answer.toSimplify();

    ModelNumber modelAnswer = createModelForAnswer(modelNumber0);
    choices = createChoiceFractions(simplify: true, minMax: modelAnswer);
  }

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(text: t.math_master.solver.solve_the_question);
    text += steps.tex(
        value: steps.htmlCalcTwoFractions(
            number1: numbers[0],
            number2: numbers[1],
            calcSymbol: steps.minus(),
            colorNum1: Colors.black,
            colorDen1: Colors.black,
            colorNum2: Colors.black,
            colorDen2: Colors.black));
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
    question.solution.solution = steps.htmlFractionsAddition(steps.minus(spacing: ""));
  }
}
