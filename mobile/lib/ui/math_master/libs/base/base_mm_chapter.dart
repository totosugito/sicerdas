import 'dart:math';

import '../models/enums.dart';
import '../models/cl_mm_chapter.dart';
import '../models/model_chapter.dart';
import '../models/my_random.dart';
import '../models/my_number.dart';
import '../models/model_question.dart';
import '../models/model_choice.dart';
import '../models/model_solution.dart';
import '../models/model_number.dart';
import '../solver/libs/roman_lib.dart';
import '../solver/libs/math_lib.dart';

class BaseMmChapter {
  late KeyPadMode padMode;
  late ClMmChapter chapter;
  late ModelChapter mdChapter;
  late MyRandom myRandom;
  late String questionInLatex = "";

  late List<MyNumber> numbers;
  late MyNumber answer;
  late ModelQuestion question;
  late List<ModelChoice> choices;
  late List<ModelChoice> choicesBool;

  late List<int> selectedType;
  late List<int> selectedRange;

  // temporary variable
  late List<int> tempSelectedType;
  late List<int> tempSelectedRange;
  late int nType;
  late int nRange;

  late int idxMissingDigit;
  late int maxChoice;

  int _getChoiceCount(KeyPadMode pad) {
    switch (pad) {
      case KeyPadMode.pad4Pad:
        return 4;
      case KeyPadMode.padYesNo:
        return 2;
      default:
        return 2;
    }
  }

  init(ClMmChapter chapter_, ModelChapter mdChapter_) {
    chapter = chapter_;
    mdChapter = mdChapter_;
    myRandom = MyRandom();

    selectedType = [];
    for (int i = 0; i < chapter_.modeTypes.length; i++) {
      if (chapter_.modeTypes[i] == true) {
        selectedType.add(i);
      }
    }
    nType = selectedType.length;

    selectedRange = [];
    for (int i = 0; i < chapter_.ranges.length; i++) {
      if (chapter_.ranges[i] == true) {
        selectedRange.add(i);
      }
    }
    nRange = selectedRange.length;

    tempSelectedType = []; // temporary type data
    tempSelectedRange = []; // temporary range data
    idxMissingDigit = -1;

    maxChoice = 2;
    for (var pad in mdChapter.pads) {
      maxChoice = max(maxChoice, _getChoiceCount(pad));
    }
  }

  bool isOneDigit() {
    bool r = true;
    for (var item in numbers) {
      r = r && item.isOneDigit();
    }
    return (r);
  }

  String getQuestionTemplate() {
    return ("");
  }

  ModelQuestion newQuestion({required KeyPadMode padMode, bool resetData = true}) {
    return ModelQuestion.empty();
  }

  createDataValue(KeyPadMode padMode) {
  }

  String createHtmlQuestion() {
    return ("");
  }

  updateSolution(ModelQuestion question, {
    required String solutionText,
    required String solveTheQuestionText,
    required String stepsAdditionTables,
    required String stepsThereforeResult,
  }) {}

  initSolution(ModelQuestion question, {required String solutionText}) {
    question.solution.module = mdChapter.getTopicLabel();
    question.solution.chapter = mdChapter.title;
    question.solution.question = createHtmlQuestion();
    question.solution.answer = solutionText;
  }

  int getSelectedRangeIndex() {
    // chapter only have one selected range
    if (selectedRange.length == 1) {
      return (selectedRange[0]);
    }

    // selected range data more than one
    if (tempSelectedRange.isEmpty) {
      tempSelectedRange = List.from(selectedRange);
    }

    int nSelectedRangeTemp = tempSelectedRange.length;
    int selectedRangeIndex = 0;
    if (nSelectedRangeTemp > 1) {
      selectedRangeIndex = myRandom.nextInt(min: 0, max: nSelectedRangeTemp - 1);
    }
    int selectedRangeValue = tempSelectedRange[selectedRangeIndex];
    tempSelectedRange.removeAt(selectedRangeIndex);

    return (selectedRangeValue);
  }

  List<ModelChoice> _createModelChoice({required List<MyNumber> rawChoices, required int choiceCount}) {
    List<ModelChoice> tmpChoices = [];
    for (int i = 0; i < choiceCount; i++) {
      tmpChoices.add(ModelChoice(id: i, status: i == 0 ? true : false, value: rawChoices[i]));
    }
    tmpChoices.shuffle();
    return (tmpChoices);
  }

  List<ModelChoice> createChoiceInteger({bool useOneDigit = false}) {
    int number1 = answer.getValue() ~/ 2.0;
    int number2 = (answer.getValue() * 1.5).toInt();
    int minNumber = number1 < number2 ? number1 : number2;
    int maxNumber = number1 < number2 ? number2 : number1;

    // prevent zero range
    minNumber = minNumber == 0 ? 1 : minNumber;
    maxNumber = maxNumber == 0 ? 9 : maxNumber;

    int spacing = myRandom.nextInt(min: 1, max: 9);
    List<MyNumber> rawChoices = [];
    rawChoices.add(answer);
    for (int i = 1; i < maxChoice; i++) {
      int checkAnswer = myRandom.nextInt(min: minNumber, max: maxNumber);
      MyNumber number = MyNumber.nextIntUnique(
          useOneDigit: useOneDigit, rawList: rawChoices, checkNumber: checkAnswer, spacing: spacing);
      rawChoices.add(number);
    }

    choicesBool = _createModelChoice(rawChoices: rawChoices, choiceCount: 2);
    return (_createModelChoice(rawChoices: rawChoices, choiceCount: maxChoice));
  }

  List<ModelChoice> createChoiceIntegerMultiplier({int baseRank = 10}) {
    int valCenter = myRandom.getNumberRankTh(answer.getVal());
    // valCenter = valCenter > 0 ? valCenter: 4;
    int valLeft = (valCenter - 3) >= 0 ? (valCenter - 3) : 0;
    int valRight = valLeft + 5;

    List<MyNumber> rawChoices = [];
    rawChoices.add(answer);
    num baseAnswer = answer.getValI() != 0 ? answer.getVal() : answer.getVal() + 1;
    for (int i = valLeft; i <= valRight; i++) {
      if (i == valCenter) {
        continue;
      }

      MyNumber number = MyNumber.clone(answer);
      int deltaRank = (i - valCenter);
      number.value = (baseAnswer * pow(baseRank, deltaRank)).toInt();
      rawChoices.add(number);
    }
    choicesBool = _createModelChoice(rawChoices: rawChoices, choiceCount: 2);
    return (_createModelChoice(rawChoices: rawChoices, choiceCount: maxChoice));
  }

  List<ModelChoice> createChoiceIntegerSimple({required int spacing}) {
    List<MyNumber> rawChoices = [];
    num valCenter = answer.getValue() / spacing;
    num valLeft = valCenter - 5 >= 1 ? valCenter - 5 : 1;
    num valRight = valCenter + 5;

    rawChoices.add(answer);
    for (int i = 1; i < maxChoice; i++) {
      int checkAnswer = myRandom.nextInt(min: valLeft.toInt(), max: valRight.toInt()) * spacing;
      MyNumber number = MyNumber.nextIntUnique(rawList: rawChoices, checkNumber: checkAnswer, spacing: spacing);
      rawChoices.add(number);
    }

    choicesBool = _createModelChoice(rawChoices: rawChoices, choiceCount: 2);
    return (_createModelChoice(rawChoices: rawChoices, choiceCount: maxChoice));
  }

  List<ModelChoice> createChoiceRomanNumeral({required LibRoman romanLib, bool useOneDigit = false}) {
    List<ModelChoice> tmpChoices = createChoiceInteger(useOneDigit: useOneDigit);
    for (int i = 0; i < maxChoice; i++) {
      ModelChoice mc = tmpChoices[i];
      mc.setText(sprintf("{%s}", [mc.value.setRomanText(romanLib)]));
    }

    for (int i = 0; i < choicesBool.length; i++) {
      ModelChoice mc = choicesBool[i];
      mc.setText(sprintf("{%s}", [mc.value.setRomanText(romanLib)]));
    }
    return (tmpChoices);
  }

  List<ModelChoice> createChoiceFractions(
      {bool isOneDigitOnly = false, bool simplify = false, bool simpleFraction = false, required ModelNumber minMax}) {
    int spacing = myRandom.nextInt(min: 1, max: 3);
    List<MyNumber> rawChoices = [];

    if (simpleFraction) {
      answer.toImproperFractions();
    }

    if (simplify) {
      answer.toSimplify();
    }
    rawChoices.add(answer);
    for (int i = 1; i < maxChoice; i++) {
      MyNumber checkAnswer = MyNumber.nextFractions(myRandom: myRandom, minMax: minMax);

      if (simpleFraction) {
        checkAnswer.toImproperFractions();
      }
      if (simplify) {
        checkAnswer.toSimplify();
      }

      MyNumber number = MyNumber.nextFractionUnique(rawList: rawChoices, checkNumber: checkAnswer, spacing: spacing);
      number.type = answer.type;
      rawChoices.add(number);
    }

    choicesBool = _createModelChoice(rawChoices: rawChoices, choiceCount: 2);
    return (_createModelChoice(rawChoices: rawChoices, choiceCount: maxChoice));
  }

  bool haveNumRanges(int idxRange) {
    return (mdChapter.ranges[idxRange].numRanges.isNotEmpty);
  }

  ModelNumber getChapterNumRange(int idxRange, int idxNumber) {
    return (mdChapter.ranges[idxRange].numRanges[idxNumber]);
  }

  List<num> getChapterRange(int idxRange) {
    return (mdChapter.ranges[idxRange].ranges);
  }

  String createQuestionInRowInt({required String question, required List<MyNumber> data, required String lastSymbol}) {
    // Example :
    // 1 + 3 = ..

    for (int i = 0; i < data.length; i++) {
      question = question.replaceAll(sprintf("@%d", [i]), data[i].toString());
    }
    question = lastSymbol.isEmpty ? question : question.replaceAll(sprintf("@%d", [data.length]), lastSymbol);
    return (question);
  }

  ModelQuestion createQuestionWithHorzLineIntSimple(
      {required String question, required List<MyNumber> data, required String lastSymbol}) {
    for (int i = 0; i < data.length; i++) {
      question = question.replaceAll(sprintf("@%d", [i]), data[i].toString());
    }
    question = lastSymbol.isEmpty ? question : question.replaceAll(sprintf("@%d", [data.length]), lastSymbol);
    return (ModelQuestion(
        question: question,
        hasSolution: mdChapter.hasSolution,
        choices: choices,
        choicesBool: choicesBool,
        solution: ModelSolution()));
  }

  ModelQuestion createQuestionWithHorzLineInt(
      {required String question, required List<MyNumber> data, required String lastSymbol}) {
    // Example :
    // 1 5
    // 2 3
    //_____ +
    // ..

    int ndata = data.length;
    List<String> dataText = [];
    String allDataText = "";
    String itemDataText = "";
    int maxLengthCharInRow = 0;
    for (int i = 0; i < ndata; i++) {
      itemDataText = data[i].toString();
      dataText.add(itemDataText);
      allDataText = sprintf("%s%s", [allDataText, itemDataText]);
      maxLengthCharInRow = maxLengthCharInRow < itemDataText.length
          ? itemDataText.length
          : maxLengthCharInRow; //get maximum number length
    }
    // add last symbol
    dataText.add(lastSymbol);
    allDataText = sprintf("%s%s", [allDataText, lastSymbol]);
    maxLengthCharInRow =
        maxLengthCharInRow < lastSymbol.length ? lastSymbol.length : maxLengthCharInRow; //get maximum number length
    ndata += 1;

    // created formatted question
    for (int idxRow = 0; idxRow < ndata; idxRow++) {
      String rowDigit = dataText[idxRow];
      int nRowDigit = rowDigit.length;
      String formattedTex = "";

      // add empty text spacing for every element digits
      String emptyChar = "";
      for (int j = 0; j < (maxLengthCharInRow - nRowDigit); j++) {
        emptyChar = sprintf("%s0", [emptyChar]);
      }
      formattedTex = emptyChar.isNotEmpty ? sprintf("\\phantom{%s}", [emptyChar]) : "";

      // create formattedTex data
      for (int idxDigit = 0; idxDigit < nRowDigit; idxDigit++) {
        formattedTex = idxDigit < nRowDigit - 1
            ? sprintf("%s %s\\", [formattedTex, rowDigit[idxDigit]])
            : sprintf("%s %s", [formattedTex, rowDigit[idxDigit]]);
      }
      question = question.replaceAll(sprintf("@%d", [idxRow]), sprintf("\\space %s \\space", [formattedTex]));
    }

    return (ModelQuestion(
        question: question,
        hasSolution: mdChapter.hasSolution,
        choices: choices,
        choicesBool: choicesBool,
        solution: ModelSolution()));
  }

  createMissingDigitIndex(List<MyNumber> data) {
    LibMath libMath = LibMath();
    int maxLength = libMath.computeMaxLengthIntFromList(data: numbers);
    int totalItem = maxLength * data.length;
    int idxMissing = myRandom.nextInt(max: totalItem - 1);

    List<String> listItem = [];
    for (var item in data) {
      var tmpList = libMath.intToListString(maxLength, item.getValI());
      for (var ii in tmpList) {
        listItem.add(ii);
      }
    }

    while (true) {
      if (listItem[idxMissing].trim().isNotEmpty) {
        break;
      } else {
        idxMissing += 1;
      }
    }
    idxMissingDigit = idxMissing;
    answer = MyNumber(value: num.parse(listItem[idxMissingDigit]));
    choices = createChoiceInteger(useOneDigit: true);
  }

  String createQuestionInLongDivInt(
      {required String question, required List<MyNumber> data, required String lastSymbol}) {
    // compute length of input and create formatted input
    List<String> listInput = [];
    for (int i = 0; i < data.length; i++) {
      listInput.add(data[i].toString());
    }
    if (lastSymbol.isNotEmpty) {
      listInput.add(sprintf("%s", [lastSymbol]));
    }

    // set division result to number unit position
    //      5
    //    _____
    // 6 / 30
    //
    int n0 = listInput[0].length;
    int n2 = listInput[2].length;
    String emptyChar0 = "";
    for (int j = 0; j < (n0 - n2); j++) {
      emptyChar0 = sprintf("%s0", [emptyChar0]);
    }
    question = question.replaceAll("@P0", emptyChar0);

    // replace input
    int maxLengthInput = 0;
    for (int i = 0; i < listInput.length; i++) {
      question = question.replaceAll(sprintf("@%d", [i]), listInput[i]);
      maxLengthInput = maxLengthInput > listInput[i].length ? maxLengthInput : listInput[i].length;
    }
    return (question);
  }
}

String sprintf(String template, List<dynamic> args) {
  int index = 0;
  return template.replaceAllMapped(RegExp(r'%[sd]'), (match) {
    if (index < args.length) {
      return args[index++].toString();
    }
    return '';
  });
}
