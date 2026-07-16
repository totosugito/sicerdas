import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../models/my_number.dart';
import 'calc_addition_steps.dart';

class CalcSubtractionSteps extends CalcAdditionSteps {
  CalcSubtractionSteps({required super.numbers, required super.answer});

  // --------------------- SUBTRACTION 1 DIGIT ----------------------
  String _htmlSubtractionSequentialTable(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    int r;
    int startNumber = numbers[1].getValI();
    for (int i = 0; i < 10; i++) {
      r = startNumber + i - numbers[1].getValI();
      html +=
          texColor(value: (startNumber + i).toString(), color: Colors.blue) +
          minus() +
          texColor(value: numbers[1].getValueIText(), color: Colors.red) +
          texEqual() +
          texColor(value: r.toString(), color: Colors.purple) +
          texBr();
    }

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String htmlSubtraction1Digit() {
    String html = "";

    // 1. table addition
    String label1 = t.math_master.solver.subtraction_tables;
    html += liSpan(value: _htmlSubtractionSequentialTable(label1));

    // 2. show the result
    String label2 = t.math_master.solver.therefore_result;
    String question = listNumbersIntToString(
      data: numbers,
      separator: minus(),
      lastSeparator: minus(),
    );
    html += liSpan(
      value: showHtmlResult(
        label: label2,
        input: tex(value: question),
        result: answer.getValueIText(),
      ),
    );
    return (ol(value: html));
  }

  // --------------------- [POSITIVE POSITIVE]----------------------
  String htmlSubtractionPosPos({
    String label = "",
    required List<MyNumber> data,
    required MyNumber result,
    int startColor = 0,
  }) {
    // CONDITION : A - B
    String html = "";

    if (data[0].getValI().abs() >= data[1].getValI().abs()) {
      List<List<String>> calcSteps = lib.calcSubtraction(data, result);
      html += liSpan(
        value: htmlSubtractionDigit(
          label: label,
          data: calcSteps,
          startColor: startColor,
        ),
      );
    } else {
      String strLabel = t.math_master.solver.use_this_rule;
      String htmlLabel = span(
        id: idStepsLabel,
        value: sprintf(strLabel, ["\n"]) + br(),
      );
      html =
          texColor(value: "a", color: autoColor[0]) +
          minus() +
          texColor(value: "b", color: autoColor[1]);
      html +=
          texEqual() +
          minus() +
          parenthesis(
            value:
                texColor(value: "b", color: autoColor[1]) +
                minus() +
                texColor(value: "a", color: autoColor[0]),
          ) +
          sprintf("&%s\\ %s>%s", [
            texText(value: t.math_master.solver.if_text),
            texColor(value: "b", color: autoColor[1]),
            texColor(value: "a", color: autoColor[0]),
          ]) +
          texBr();
      html +=
          texEqual() +
          minus() +
          parenthesis(
            value:
                texColor(
                  value: data[1].getValueIAbsText(),
                  color: autoColor[1],
                ) +
                minus() +
                texColor(
                  value: data[0].getValueIAbsText(),
                  color: autoColor[0],
                ),
          ) +
          texBr();
      html += texEqual() + result.toString();
      html = liSpan(
        value: htmlLabel + tex(value: texAligned(value: html)),
      );
    }

    return (html);
  }

  // --------------------- [NEGATIVE NEGATIVE]----------------------
  String _htmlRuleSubtractionNegNeg(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    html +=
        texColor(value: "-a", color: autoColor[0]) +
        minus() +
        parenthesis(
          value: texColor(value: "-b", color: autoColor[1]),
        );
    html +=
        texEqual() +
        texColor(value: "-a", color: autoColor[0]) +
        plus() +
        texColor(value: "b", color: autoColor[1]) +
        texBr();
    html +=
        texEqual() +
        minus() +
        parenthesis(
          value:
              texColor(value: "a", color: autoColor[0]) +
              minus() +
              texColor(value: "b", color: autoColor[1]),
        ) +
        sprintf("&%s\\ %s>%s", [
          texText(value: t.math_master.solver.if_text),
          texColor(value: "a", color: autoColor[0]),
          texColor(value: "b", color: autoColor[1]),
        ]) +
        texBr();
    html +=
        texEqual() +
        texColor(value: "b", color: autoColor[1]) +
        minus() +
        texColor(value: "a", color: autoColor[0]) +
        sprintf("&%s\\ %s>%s", [
          texText(value: t.math_master.solver.if_text),
          texColor(value: "b", color: autoColor[1]),
          texColor(value: "a", color: autoColor[0]),
        ]) +
        texBr();

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlResultSubtractionNegNeg(
    List<MyNumber> data,
    MyNumber result,
    String label,
    String question,
  ) {
    String htmlLabel = span(
      id: idStepsLabel,
      value: sprintf(label, [question, "\n"]),
    );
    String html = "";

    if (data[0].getValI().abs() >= data[1].getValI().abs()) {
      html +=
          texColor(value: data[0].getValueIText(), color: autoColor[0]) +
          minus() +
          parenthesis(
            value: texColor(
              value: data[1].getValueIText(),
              color: autoColor[1],
            ),
          );
      html +=
          texEqual() +
          texColor(value: data[0].getValueIText(), color: autoColor[0]) +
          plus() +
          texColor(value: data[1].getValueIAbsText(), color: autoColor[1]) +
          texBr();
      html +=
          texEqual() +
          minus() +
          parenthesis(
            value:
                texColor(
                  value: data[0].getValueIAbsText(),
                  color: autoColor[0],
                ) +
                minus() +
                texColor(
                  value: data[1].getValueIAbsText(),
                  color: autoColor[1],
                ),
          ) +
          texBr();
    } else {
      html +=
          texColor(value: data[0].getValueIText(), color: autoColor[0]) +
          minus() +
          parenthesis(
            value: texColor(
              value: data[1].getValueIText(),
              color: autoColor[1],
            ),
          );
      html +=
          texEqual() +
          texColor(value: data[0].getValueIText(), color: autoColor[0]) +
          plus() +
          texColor(value: data[1].getValueIAbsText(), color: autoColor[1]) +
          texBr();
      html +=
          texEqual() +
          texColor(value: data[1].getValueIAbsText(), color: autoColor[1]) +
          minus() +
          texColor(value: data[0].getValueIAbsText(), color: autoColor[0]) +
          texBr();
    }

    html += texEqual() + result.getValueIText();
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  // --------------------- [NEGATIVE POSITIVE]----------------------
  String _htmlRuleSubtractionNegPos(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    html +=
        texColor(value: "-a", color: autoColor[0]) +
        minus() +
        texColor(value: "b", color: autoColor[1]);
    html +=
        texEqual() +
        minus() +
        parenthesis(
          value:
              texColor(value: "b", color: autoColor[1]) +
              plus() +
              texColor(value: "a", color: autoColor[0]),
        );

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlResultSubtractionNegPos(
    List<MyNumber> data,
    MyNumber result,
    String label,
    String question,
  ) {
    String htmlLabel = span(
      id: idStepsLabel,
      value: sprintf(label, [question, "\n"]),
    );
    String html = "";

    html +=
        texColor(value: data[0].getValueIText(), color: autoColor[0]) +
        minus() +
        texColor(value: data[1].getValueIText(), color: autoColor[1]) +
        texEqual() +
        minus() +
        parenthesis(
          value:
              texColor(value: data[0].getValueIAbsText(), color: autoColor[0]) +
              plus() +
              texColor(value: data[1].getValueIAbsText(), color: autoColor[1]),
        ) +
        texBr();

    html += texEqual() + result.getValueIText();
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  // --------------------- [POSITIVE NEGATIVE ]----------------------
  String _htmlRuleSubtractionPosNeg(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    html +=
        texColor(value: "a", color: autoColor[0]) +
        minus() +
        parenthesis(
          value: texColor(value: "-b", color: autoColor[1]),
        );
    html +=
        texEqual() +
        texColor(value: "a", color: autoColor[0]) +
        plus() +
        texColor(value: "b", color: autoColor[1]);

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlResultSubtractionPosNeg(
    List<MyNumber> data,
    MyNumber result,
    String label,
    String question,
  ) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, [question, "\n"])) + br();
    String html = "";

    html +=
        texColor(value: data[0].getValueIText(), color: autoColor[0]) +
        minus() +
        parenthesis(
          value: texColor(value: data[1].getValueIText(), color: autoColor[1]),
        );
    html +=
        texEqual() +
        texColor(value: data[0].getValueIAbsText(), color: autoColor[0]) +
        plus() +
        texColor(value: data[1].getValueIAbsText(), color: autoColor[1]) +
        texBr();

    html += texEqual() + result.getValueIText();
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String htmlSubtraction() {
    String html = "";

    bool isNegative0 = numbers[0].isNegative();
    bool isNegative1 = numbers[1].isNegative();

    String labelRule = "";
    if ((!isNegative0) & (!isNegative1)) {
      // -----------------------------
      // CONDITION : A - B
      // -----------------------------
      String label = t.math_master.solver.do_the_calculation;
      html += htmlSubtractionPosPos(
        label: label,
        data: numbers,
        result: answer,
      );

      // show the result
      String labelResult = t.math_master.solver.therefore_result;
      String question = listNumbersIntToString(
        data: numbers,
        separator: minus(),
        lastSeparator: minus(),
      );
      html += liSpan(
        value: showHtmlResult(
          label: labelResult,
          input: tex(value: question),
          result: answer.getValueIText(),
        ),
      );
    } else if ((!isNegative0) & (isNegative1)) {
      // -----------------------------
      // CONDITION : A - (-B)
      // -----------------------------
      // rule
      labelRule = t.math_master.solver.use_this_rule;
      html += liSpan(value: _htmlRuleSubtractionPosNeg(labelRule));

      // show the result
      String label2 = t.math_master.solver.do_the_calculation;
      html += liSpan(
        value: _htmlResultSubtractionPosNeg(numbers, answer, label2, br()),
      );

      // show the result
      String labelResult = t.math_master.solver.therefore_result;
      String question = listNumbersIntToString(
        data: numbers,
        separator: minus(),
        lastSeparator: minus(),
      );
      html += liSpan(
        value: showHtmlResult(
          label: labelResult,
          input: tex(value: question),
          result: answer.getValueIText(),
        ),
      );
    } else if ((isNegative0) & (!isNegative1)) {
      // -----------------------------
      // CONDITION : -A - B
      // -----------------------------
      // rule
      labelRule = t.math_master.solver.use_this_rule;
      html += liSpan(value: _htmlRuleSubtractionNegPos(labelRule));

      // show the result
      String label2 = t.math_master.solver.do_the_calculation;
      html += liSpan(
        value: _htmlResultSubtractionNegPos(numbers, answer, label2, br()),
      );

      // show the result
      String labelResult = t.math_master.solver.therefore_result;
      String question = listNumbersIntToString(
        data: numbers,
        separator: minus(),
        lastSeparator: minus(),
      );
      html += liSpan(
        value: showHtmlResult(
          label: labelResult,
          input: tex(value: question),
          result: answer.getValueIText(),
        ),
      );
    } else {
      // -----------------------------
      // CONDITION : -A - (-B)
      // -----------------------------
      // 1. rule
      labelRule = t.math_master.solver.use_this_rule;
      html += liSpan(value: _htmlRuleSubtractionNegNeg(labelRule));

      // show the result
      String label2 = t.math_master.solver.do_the_calculation;
      html += liSpan(
        value: _htmlResultSubtractionNegNeg(numbers, answer, label2, br()),
      );

      // show the result
      String labelResult = t.math_master.solver.therefore_result;
      String question = listNumbersIntToString(
        data: numbers,
        separator: minus(),
        lastSeparator: minus(),
      );
      html += liSpan(
        value: showHtmlResult(
          label: labelResult,
          input: tex(value: question),
          result: answer.getValueIText(),
        ),
      );
    }

    return (ol(value: html));
  }

  String htmlSubtractionMissingDigit(int idxMissingDigit) {
    String html = "";

    // 1. do the calculation
    String label = t.math_master.solver.do_the_calculation;
    html += htmlSubtractionPosPos(
      label: label,
      data: [numbers[0], numbers[1]],
      result: numbers[2],
    );

    // 2. show the result
    String label2 = t.math_master.solver.therefore_missing_digit;
    html += liSpan(
      value: showHtmlResult(
        label: label2,
        input: "",
        result: answer.getValueIText(),
      ),
    );

    return (ol(value: html));
  }
}
