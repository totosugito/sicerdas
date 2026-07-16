import 'package:flutter/material.dart';

import 'package:bse/i18n/strings.g.dart';
import '../models/my_number.dart';
import 'calc_subtraction_steps.dart';

class CalcMultiplicationSteps extends CalcSubtractionSteps {
  CalcMultiplicationSteps({required super.numbers, required super.answer});

  // --------------------- SUBTRACTION 1 DIGIT ----------------------
  String _htmlMultiplicationSequentialTable(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    int secondary;
    int result;
    int primaryNumber = numbers[0].getValI();
    for (int i = 1; i <= 10; i++) {
      secondary = i;
      result = primaryNumber * secondary;
      html += texColor(value: (primaryNumber).toString(), color: Colors.blue) +
          texTimes() +
          texColor(value: secondary.toString(), color: Colors.red) +
          texEqual() +
          texColor(value: result.toString(), color: Colors.purple) +
          texBr();
    }

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String htmlMultiplication1DigitQuestion() {
    String html = listNumbersIntToString(data: numbers, separator: times(), lastSeparator: times());
    return (html);
  }

  String htmlMultiplication1Digit() {
    String html = "";

    // 1. table addition
    String label1 = t.math_master.solver.multiplication_tables;
    html += liSpan(value: _htmlMultiplicationSequentialTable(label1));

    // 2. show the result
    String label2 = t.math_master.solver.therefore_result;
    String question = htmlMultiplication1DigitQuestion();
    html += liSpan(value: showHtmlResult(label: label2, input: tex(value: question), result: answer.getValueIText()));
    return (ol(value: html));
  }

  // --------------------- [POSITIVE NEGATIVE]----------------------
  String _htmlRuleMultiplicationPosNeg(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    html += texColor(value: "a", color: autoColor[0]) +
        texTimes() +
        parenthesis(value: texColor(value: "-b", color: autoColor[1])) +
        texEqual() +
        minus() +
        parenthesis(
            value: texColor(value: "a", color: autoColor[0]) +
                texTimes() +
                texColor(
                  value: "b",
                  color: autoColor[1],
                ));
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  // --------------------- [NEGATIVE POSITIVE]----------------------
  String _htmlRuleMultiplicationNegPos(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    html += texColor(value: "-a", color: autoColor[0]) +
        texTimes() +
        texColor(value: "b", color: autoColor[1]) +
        texEqual() +
        minus() +
        parenthesis(
            value: texColor(value: "a", color: autoColor[0]) +
                texTimes() +
                texColor(
                  value: "b",
                  color: autoColor[1],
                ));
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  // --------------------- [NEGATIVE NEGATIVE]----------------------
  String _htmlRuleMultiplicationNegNeg(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    html += texColor(value: "-a", color: autoColor[0]) +
        texTimes() +
        parenthesis(value: texColor(value: "-b", color: autoColor[1])) +
        texEqual() +
        texColor(value: "a", color: autoColor[0]) +
        texTimes() +
        texColor(
          value: "b",
          color: autoColor[1],
        );
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  // --------------------- [POSITIVE POSITIVE]----------------------
  String htmlMultiplicationPosPos({
    String label = "",
    required List<MyNumber> data,
    required MyNumber result,
    int startColor = 0,
  }) {
    // CONDITION : A * B
    String html = "";

    // 1. do the calculation
    String stepLabel = "";
    List<List<String>> calcSteps = lib.calcMultiplication(data, result);
    List<String> multiplier = calcSteps[1];
    int nStep = calcSteps.length ~/ 2;

    bool haveAdditionStep = calcSteps.length > 4 ? true:false;
    if(!haveAdditionStep) {
      nStep += 1;
    }
    for (int i = 1; i < nStep; i++) {
      if (i < nStep - 1) {
        stepLabel = label + tex(value: data[0].toString() + texTimes() + multiplier[multiplier.length - i]);
        html += liSpan(
            value: htmlMultiplicationStep(
                label: stepLabel,
                data: calcSteps,
                lastStep: false,
                step: i,
                startColor: startColor));
      } else {
        stepLabel = t.math_master.solver.do_addition_text;
        if(haveAdditionStep) {
          html += liSpan(
              value: htmlMultiplicationStep(
                  label: stepLabel,
                  data: calcSteps,
                  lastStep: true,
                  step: i,
                  startColor: startColor));
        }
      }
    }

    return (html);
  }

  String htmlMultiplicationDigitsQuestion() {
    String html = listNumbersIntToString(data: numbers, separator: texTimes(), lastSeparator: texTimes());
    return (html);
  }

  String htmlMultiplicationDigitsSteps({bool showLearnPrevChapter=true}) {
    String html = "";

    bool isNegative0 = numbers[0].isNegative();
    bool isNegative1 = numbers[1].isNegative();

    if(showLearnPrevChapter) {
      String badgePreviousModule = createHtmlBadge(t.math_master.topics_multiplication,
          t.math_master.chapter_multiplication_2_digits);
      String label1 = t.math_master.steps_complete_prev_module(module: badgePreviousModule, br: br());
      html += liSpan(value: span(id: idStepsLabel, value: label1));
    }

    String labelRule = "";
    if ((!isNegative0) & (!isNegative1)) {
      // -----------------------------
      // CONDITION : A * B
      // -----------------------------
    } else if ((!isNegative0) & (isNegative1)) {
      // -----------------------------
      // CONDITION : A * -B
      // -----------------------------
      labelRule = t.math_master.solver.use_this_rule;
      html += liSpan(value: _htmlRuleMultiplicationPosNeg(labelRule));
    } else if ((isNegative0) & (!isNegative1)) {
      // -----------------------------
      // CONDITION : -A * B
      // -----------------------------
      labelRule = t.math_master.solver.use_this_rule;
      html += liSpan(value: _htmlRuleMultiplicationNegPos(labelRule));
    } else {
      // -----------------------------
      // CONDITION : -A * -B
      // -----------------------------
      labelRule = t.math_master.solver.use_this_rule;
      html += liSpan(value: _htmlRuleMultiplicationNegNeg(labelRule));
    }

    String label = t.math_master.do_calculation_of_text;
    html += htmlMultiplicationPosPos(
        label: label, data: [MyNumber.abs(numbers[0]), MyNumber.abs(numbers[1])], result: MyNumber.abs(answer));

    // show the result
    String labelResult = t.math_master.solver.therefore_result;
    String question = htmlMultiplicationDigitsQuestion();
    html += liSpan(
        value: showHtmlResult(
      label: labelResult,
      input: tex(value: question),
      result: answer.getValueIText(),
    ));
    return (ol(value: html));
  }
}
