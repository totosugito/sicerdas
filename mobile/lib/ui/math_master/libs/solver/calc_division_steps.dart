import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../models/my_number.dart';
import 'calc_addition_steps.dart';
import 'calc_subtraction_steps.dart';

class CalcDivisionSteps extends CalcSubtractionSteps {
  CalcDivisionSteps({required super.numbers, required super.answer});

  // --------------------- SUBTRACTION 1 DIGIT ----------------------
  String _htmlDivisionSequentialTable(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    int secondary;
    int result;
    int primaryNumber = numbers[1].getValI();
    for (int i = 1; i <= 10; i++) {
      secondary = primaryNumber * i;
      result = i;
      html += texColor(value: (secondary).toString(), color: Colors.blue) +
          divide() +
          texColor(value: numbers[1].getValueIText(), color: Colors.red) +
          texEqual() +
          texColor(value: result.toString(), color: Colors.purple) +
          texBr();
    }

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String htmlDivision1DigitQuestion() {
    String html = listNumbersIntToString(data: numbers, separator: divide(), lastSeparator: divide());
    return (html);
  }

  String htmlDivision1Digit() {
    String html = "";

    // 1. table addition
    String label1 = t.math_master.solver.division_tables;
    html += liSpan(value: _htmlDivisionSequentialTable(label1));

    // 2. show the result
    String label2 = t.math_master.solver.therefore_result;
    String question = htmlDivision1DigitQuestion();
    html += liSpan(value: showHtmlResult(label: label2, input: tex(value: question), result: answer.getValueIText()));
    return (ol(value: html));
  }

  String _htmlDivisionSteps({String label = "", required List<MyNumber> data, required MyNumber result}) {
    String htmlLabel = span(id: idStepsLabel, value: sprintf(label, [br()]));

    // 1. do the calculation
    List<List<String>> calcSteps = lib.calcDivision(data, result);

    String newLineSpacing = texBr(isNormal: false, spacing: "[-0.5em]");
    String textDenominator = "${data[1].getValueIText()}\\large{/}\\normalsize";
    String smallSpacing = "\\phantom{\\tiny.}";
    String subtractSymbol = texSmall(value: "_-");

    // create texQuestion
    String html = texPhantom(value: textDenominator) +
        texUnderline(
            value: smallSpacing + listStringToTexRow(data: calcSteps[0], isAutoColor: true, spacing: "\\space")) +
        texPhantom(value: subtractSymbol) +
        newLineSpacing; // answer
    html += textDenominator +
        listStringToTexRow(data: calcSteps[2], spacing: "\\space") +
        texPhantom(value: subtractSymbol) +
        newLineSpacing; // answer

    Color color;
    int idxColor = calcSteps[0].length - answer.toString().length;
    for (int i = 3; i < calcSteps.length; i++) {
      if (i % 2 == 1) {
        color = autoColor[idxColor];
        idxColor += 1;
      } else {
        color = Colors.black;
      }
      String textStep = listStringToTexRow(data: calcSteps[i], color: color, spacing: "\\space"); // answer
      html += texPhantom(value: textDenominator) +
          (i % 2 == 1
              ? texUnderline(value: texColor(value: textStep, color: color)) + subtractSymbol
              : textStep + texPhantom(value: subtractSymbol)) +
          newLineSpacing;
    }
    return (htmlLabel + tex(value: texAligned(value: html)));
  }

  String htmlDivisionDigitsSteps() {
    String html = "";

    String label = t.math_master.solver.do_the_calculation;
    String textSteps = _htmlDivisionSteps(
        label: label, data: [MyNumber.abs(numbers[0]), MyNumber.abs(numbers[1])], result: MyNumber.abs(answer));
    html += liSpan(value: textSteps);

    // 2. show the result
    String label2 = t.math_master.solver.therefore_result;
    String question = htmlDivision1DigitQuestion();
    html += liSpan(value: showHtmlResult(label: label2, input: tex(value: question), result: answer.getValueIText()));
    return (ol(value: html));
  }
}
