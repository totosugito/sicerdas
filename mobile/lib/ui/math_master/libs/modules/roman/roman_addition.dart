import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import '../../models/model_solution.dart';
import '../../models/my_number.dart';
import '../../solver/libs/roman_lib.dart';
import '../../solver/roman_steps.dart';
import 'roman_roman_to_number.dart';

class RomanAddition extends RomanRomanToNumber {
  RomanAddition.init(super.chapter, super.mdChapter) : super.init();

  @override
  String getQuestionTemplate() {
    if (isOneDigit()) {
      switch (padMode) {
        case KeyPadMode.padYesNo:
          return ("@0 + @1 = @2");
        default:
          return ("@0 + @1");
      }
    } else {
      return ("\\begin{array}{r} @0\\space\\phantom{+}\\\\ @1 \\space {+}\\\\ \\hline @2\\space\\phantom{+}\\end{array}");
    }
  }

  @override
  void createDataValue(KeyPadMode padMode) {
    LibRoman libRoman = LibRoman();

    int selectedRangeIndex = getSelectedRangeIndex();
    numbers = [];
    MyNumber val0 = MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 0));
    MyNumber val1 = MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 1));
    answer = val0 + val1;
    val0.setRomanText(libRoman); // set roman string
    val1.setRomanText(libRoman); // set roman string

    numbers.add(val0);
    numbers.add(val1);
    choices = createChoiceInteger();
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
        if (isOneDigit()) {
          question = createQuestionInRowInt(
              question: question,
              data: numbers,
              lastSymbol: choicesBool[1].getText());
          return (ModelQuestion(
              question: question,
              hasSolution: mdChapter.hasSolution,
              choices: choices,
              choicesBool: choicesBool,
              isLatex: isLatexQuestion,
              solution: ModelSolution()));
        } else {
          return (createQuestionWithHorzLineIntSimple(
              question: question,
              data: numbers,
              lastSymbol: choicesBool[1].getText()));
        }
      default:
        if (isOneDigit()) {
          question = createQuestionInRowInt(
              question: question, data: numbers, lastSymbol: "..");
          return (ModelQuestion(
              question: question,
              hasSolution: mdChapter.hasSolution,
              choices: choices,
              choicesBool: choicesBool,
              isLatex: isLatexQuestion,
              solution: ModelSolution()));
        } else {
          return (createQuestionWithHorzLineIntSimple(
              question: question, data: numbers, lastSymbol: ".."));
        }
    }
  }

  @override
  String createHtmlQuestion() {
    String text = steps.divQuestionLabel(
        text: t.math_master.solver.solve_the_question);
    text += steps.tex(
        value: numbers[0].toString() + steps.plus() + numbers[1].toString());
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
    steps = RomanSteps(numbers: numbers, answer: answer);
    initSolution(question, solutionText: solutionText);
    question.solution.solution = steps.htmlRomanCalc(false);
  }
}
