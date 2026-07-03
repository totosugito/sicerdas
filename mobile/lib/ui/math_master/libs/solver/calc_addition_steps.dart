import 'package:flutter/material.dart';
import '../models/my_number.dart';
import 'calc_steps.dart';

class MathMasterLocale {
  static MathMasterLocale? of(dynamic context) => MathMasterLocale();
  String get steps_addition_tables => "Tabel Penjumlahan";
  String get steps_therefore_result => "Maka Hasilnya";
  String get if_text => "jika";
  String get steps_do_the_calculation => "Lakukan perhitungan:";
  String get steps_use_this_rule => "Gunakan aturan ini:";
  String get steps_therefore_missing_digit => "Maka Digit yang Hilang:";
}

class CalcAdditionSteps extends CalcSteps {
  dynamic get context => null;

  CalcAdditionSteps({required List<MyNumber> numbers, required MyNumber answer})
      : super(numbers, answer);

  // --------------------- ADDITION 1 DIGIT ----------------------
  String _htmlAdditionSequentialTable(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    int r;
    for (int i = 0; i < 10; i++) {
      r = numbers[0].getValI() + i;
      html += texColor(value: numbers[0].getValueIText(), color: Colors.blue) +
          plus() +
          texColor(value: i.toString(), color: Colors.green) +
          texEqual() +
          texColor(value: r.toString(), color: Colors.purple) +
          texBr();
    }

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String htmlAddition1Digit({
    String stepsAdditionTables = "Tabel Penjumlahan",
    String stepsThereforeResult = "Maka Hasilnya",
  }) {
    String html = "";

    // 1. table addition
    html += liSpan(value: _htmlAdditionSequentialTable(stepsAdditionTables));

    // 2. show the result
    String question = listNumbersIntToString(data: numbers, separator: plus(), lastSeparator: plus());
    html += liSpan(value: showHtmlResult(label: stepsThereforeResult, input: tex(value: question), result: answer.getValueIText()));
    return (ol(value: html));
  }

  // --------------------- [POSITIVE POSITIVE]----------------------
  String htmlAdditionPosPos({
    String label = "",
    required List<MyNumber> data,
    required MyNumber result,
    int startColor = 0,
  }) {
    // CONDITION : A + B
    String html = "";

    // 1. do the calculation
    List<List<String>> calcSteps = lib.calcAddition(data, result);
    html += liSpan(value: htmlAdditionDigit(label: label, data: calcSteps, startColor: startColor));

    return (html);
  }

  // --------------------- [POSITIVE NEGATIVE]----------------------
  String _htmlRuleAdditionPosNeg(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    html += texColor(value: "a", color: autoColor[0]) +
        plus() +
        parenthesis(value: texColor(value: "-b", color: autoColor[1])) +
        texEqual() +
        texColor(value: "a", color: autoColor[0]) +
        minus() +
        texColor(value: "b", color: autoColor[1]) +
        sprintf("&%s\\ %s>%s", [
          texText(value: MathMasterLocale.of(context)!.if_text),
          texColor(value: "a", color: autoColor[0]),
          texColor(value: "b", color: autoColor[1])
        ]) +
        texBr();
    html += texEqual() +
        minus() +
        parenthesis(
            value: texColor(value: "b", color: autoColor[1]) + minus() + texColor(value: "a", color: autoColor[0])) +
        sprintf("&%s\\ %s>%s", [
          texText(value: MathMasterLocale.of(context)!.if_text),
          texColor(value: "b", color: autoColor[1]),
          texColor(value: "a", color: autoColor[0])
        ]);

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlResultAdditionPosNeg(List<MyNumber> data, MyNumber result, String label, String question) {
    String htmlLabel = span(id: idStepsLabel, value: sprintf(label, [question, "\n"]));
    String html = "";

    if (data[0].getValI().abs() >= data[1].getValI().abs()) {
      html += texColor(value: data[0].getValueIText(), color: autoColor[0]) +
          plus() +
          parenthesis(value: texColor(value: data[1].getValueIText(), color: autoColor[1])) +
          texEqual() +
          texColor(value: data[0].getValueIAbsText(), color: autoColor[0]) +
          minus() +
          texColor(value: data[1].getValueIAbsText(), color: autoColor[1]) +
          texBr();
    } else {
      html += texColor(value: data[0].getValueIText(), color: autoColor[0]) +
          plus() +
          parenthesis(value: texColor(value: data[1].getValueIText(), color: autoColor[1])) +
          texEqual() +
          minus() +
          parenthesis(
              value: texColor(value: data[1].getValueIAbsText(), color: autoColor[1]) +
                  minus() +
                  texColor(value: data[0].getValueIAbsText(), color: autoColor[0])) +
          texBr();
    }

    html += texEqual() + result.getValueIText();
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String htmlAdditionPosNeg({
    String label = "",
    required List<MyNumber> data,
    required MyNumber result,
    int startColor = 0,
  }) {
    // CONDITION : A + (-B)
    String html = "";
    if (data[0].getValI().abs() >= data[1].getValI().abs()) {
      // A + (-B) = A - B
      List<List<String>> calcSteps = lib.calcSubtraction([MyNumber.abs(data[0]), MyNumber.abs(data[1])], result);
      html += liSpan(value: htmlSubtractionDigit(label: label, data: calcSteps, startColor: startColor));
    } else {
      // A + (-B) = - (B - A)
      List<List<String>> calcSteps =
          lib.calcSubtraction([MyNumber.abs(data[1]), MyNumber.abs(data[0])], MyNumber.abs(result));
      html += liSpan(value: htmlSubtractionDigit(label: label, data: calcSteps, startColor: startColor));
    }

    return (html);
  }

  // --------------------- [NEGATIVE POSITIVE]----------------------
  String _htmlRuleAdditionNegPos(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    html += texColor(value: "-a", color: autoColor[0]) + plus() + texColor(value: "b", color: autoColor[1]);
    html += texEqual() +
        minus() +
        parenthesis(
            value: texColor(value: "a", color: autoColor[0]) + minus() + texColor(value: "b", color: autoColor[1])) +
        sprintf("&%s\\ %s>%s", [
          texText(value: MathMasterLocale.of(context)!.if_text),
          texColor(value: "a", color: autoColor[0]),
          texColor(value: "b", color: autoColor[1])
        ]) +
        texBr();
    html += texEqual() +
        texColor(value: "b", color: autoColor[1]) +
        minus() +
        texColor(value: "a", color: autoColor[0]) +
        sprintf("&%s\\ %s>%s", [
          texText(value: MathMasterLocale.of(context)!.if_text),
          texColor(value: "b", color: autoColor[1]),
          texColor(value: "a", color: autoColor[0])
        ]) +
        texBr();

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlResultAdditionNegPos(List<MyNumber> data, MyNumber result, String label, String question) {
    String htmlLabel = span(id: idStepsLabel, value: sprintf(label, [question, "\n"]));
    String html = "";

    if (data[0].getValI().abs() >= data[1].getValI().abs()) {
      html += texColor(value: data[0].getValueIText(), color: autoColor[0]) +
          plus() +
          texColor(value: data[1].getValueIText(), color: autoColor[1]) +
          texEqual() +
          minus() +
          parenthesis(
              value: texColor(value: data[0].getValueIAbsText(), color: autoColor[0]) +
                  minus() +
                  texColor(value: data[1].getValueIAbsText(), color: autoColor[1])) +
          texBr();
    } else {
      html += texColor(value: data[0].getValueIText(), color: autoColor[0]) +
          plus() +
          texColor(value: data[1].getValueIText(), color: autoColor[1]) +
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

  String htmlAdditionNegPos({
    String label = "",
    required List<MyNumber> data,
    required MyNumber result,
    int startColor = 0,
  }) {
    // CONDITION : -A + B
    // -A + B = -(A - B)
    // -A + B = A - B
    String html = "";
    return (html);
  }

  // --------------------- [NEGATIVE NEGATIVE]----------------------
  String _htmlRuleAdditionNegNeg(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = "";
    html += texColor(value: "-a", color: autoColor[0]) +
        plus() +
        parenthesis(value: texColor(value: "-b", color: autoColor[1])) +
        texEqual() +
        minus() +
        parenthesis(
            value: texColor(value: "a", color: autoColor[0]) +
                plus() +
                texColor(
                  value: "b",
                  color: autoColor[1],
                ));
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlResultAdditionNegNeg(List<MyNumber> data, MyNumber result, String label, String question) {
    String htmlLabel = span(id: idStepsLabel, value: sprintf(label, [question, "\n"]));
    String html = "";

    html += texColor(value: data[0].getValueIText(), color: autoColor[0]) +
        plus() +
        parenthesis(value: texColor(value: data[1].getValueIText(), color: autoColor[1])) +
        texEqual() +
        minus() +
        parenthesis(
            value: texColor(value: data[0].getValueIAbsText(), color: autoColor[0]) +
                plus() +
                texColor(
                  value: data[1].getValueIAbsText(),
                  color: autoColor[1],
                )) +
        texBr();

    html += texEqual() + result.getValueIText();
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String createQuestionMissingDigit({
    required int idxPos,
    String symbol = "+",
    String smSpacing = " \\ ",
    String lgSpacing = " \\ ",
  }) {
    List<List<String>> listCalc = lib.calcAddition([numbers[0], numbers[1]], numbers[2]);

    String calcSymbol = texFootNote(value: symbol);
    String calcSymbolPhantom = texFootNote(value: texPhantom(value: symbol));

    String html = "";
    int idxPos_ = 0;

    // create addition variable
    for (int i = 1; i <= 2; i++) {
      var item = listCalc[i];
      for (int j = 0; j < item.length; j++) {
        if (idxPos == idxPos_) {
          html += texScriptSize(value: "") + texFbox(value: "?") + texNormalSize(value: "");
        } else {
          html += smSpacing + ((item[j].trim().isNotEmpty) ? item[j] : texPhantom(value: "0"));
        }
        html += j < item.length - 1 ? lgSpacing : smSpacing;
        idxPos_ += 1;
      }
      html += ((i != 2) ? calcSymbolPhantom : calcSymbol) + texBr();
    }
    // show horizontal line
    html += texHline();

    // show result
    var item = listCalc[3];
    for (int j = 0; j < item.length; j++) {
      if (idxPos == idxPos_) {
        html += texScriptSize(value: "") + texFbox(value: "?") + texNormalSize(value: "");
      } else {
        html += smSpacing + ((item[j].trim().isNotEmpty) ? item[j] : texPhantom(value: "0"));
      }
      html += j < item.length - 1 ? lgSpacing : smSpacing;
      idxPos_ += 1;
    }
    html += calcSymbolPhantom + texBr();

    return (texMatrix(value: html));
  }

  String createQuestionSubtractionMissingDigit({
    required int idxPos,
    String symbol = "+",
    String smSpacing = " \\ ",
    String lgSpacing = " \\ ",
  }) {
    List<List<String>> listCalc = lib.calcSubtraction([numbers[0], numbers[1]], numbers[2]);

    String calcSymbol = texFootNote(value: symbol);
    String calcSymbolPhantom = texFootNote(value: texPhantom(value: symbol));

    String html = "";
    int idxPos_ = 0;

    // create addition variable
    for (int i = 1; i <= 2; i++) {
      var item = listCalc[i];
      for (int j = 0; j < item.length; j++) {
        if (idxPos == idxPos_) {
          html += texScriptSize(value: "") + texFbox(value: "?") + texNormalSize(value: "");
        } else {
          html += smSpacing + ((item[j].trim().isNotEmpty) ? item[j] : texPhantom(value: "0"));
        }
        html += j < item.length - 1 ? lgSpacing : smSpacing;
        idxPos_ += 1;
      }
      html += ((i != 2) ? calcSymbolPhantom : calcSymbol) + texBr();
    }
    // show horizontal line
    html += texHline();

    // show result
    var item = listCalc[3];
    for (int j = 0; j < item.length; j++) {
      if (idxPos == idxPos_) {
        html += texScriptSize(value: "") + texFbox(value: "?") + texNormalSize(value: "");
      } else {
        html += smSpacing + ((item[j].trim().isNotEmpty) ? item[j] : texPhantom(value: "0"));
      }
      html += j < item.length - 1 ? lgSpacing : smSpacing;
      idxPos_ += 1;
    }
    html += calcSymbolPhantom + texBr();

    return (texMatrix(value: html));
  }

  String htmlAdditionNegNeg(
      {String label = "", required List<MyNumber> data, required MyNumber result, int startColor = 0}) {
    // -A + -B = -(A+B)
    String html = htmlAdditionPosPos(
      label: label,
      data: [MyNumber.abs(data[0]), MyNumber.abs(data[1])],
      result: MyNumber.abs(result),
      startColor: 2,
    );
    return (html);
  }

  String htmlAddition() {
    String html = "";

    bool isNegative0 = numbers[0].isNegative();
    bool isNegative1 = numbers[1].isNegative();

    String labelRule = "";
    if ((!isNegative0) & (!isNegative1)) {
      // -----------------------------
      // CONDITION : A + B
      // -----------------------------
      String label = MathMasterLocale.of(context)!.steps_do_the_calculation;
      html += htmlAdditionPosPos(label: label, data: numbers, result: answer);

      // show the result
      String labelResult = MathMasterLocale.of(context)!.steps_therefore_result;
      String question = listNumbersIntToString(data: numbers, separator: plus(), lastSeparator: plus());
      html += liSpan(
          value: showHtmlResult(
        label: labelResult,
        input: tex(value: question),
        result: answer.getValueIText(),
      ));
    } else if ((!isNegative0) & (isNegative1)) {
      // -----------------------------
      // CONDITION : A + -B
      // -----------------------------
      // 1. rule
      labelRule = MathMasterLocale.of(context)!.steps_use_this_rule;
      html += liSpan(value: _htmlRuleAdditionPosNeg(labelRule));

      // 2. do the calculation
      // String label1 = MasterLocalizations.of(context)!.steps_do_the_calculation;
      // html += liSpan(value: htmlAdditionPosNeg(label: label1, data: numbers, result: answer, startColor: 2));

      // show the result
      String label2 = MathMasterLocale.of(context)!.steps_do_the_calculation;
      html += liSpan(value: _htmlResultAdditionPosNeg(numbers, answer, label2, br()));

      // show the result
      String labelResult = MathMasterLocale.of(context)!.steps_therefore_result;
      String question = listNumbersIntToString(data: numbers, separator: plus(), lastSeparator: plus());
      html += liSpan(
          value: showHtmlResult(
            label: labelResult,
            input: tex(value: question),
            result: answer.getValueIText(),
          ));
    } else if ((isNegative0) & (!isNegative1)) {
      // -----------------------------
      // CONDITION : -A + B
      // -----------------------------
      // 1. rule
      labelRule = MathMasterLocale.of(context)!.steps_use_this_rule;
      html += liSpan(value: _htmlRuleAdditionNegPos(labelRule));

      // 2. do the calculation
      // String label1 = MasterLocalizations.of(context)!.steps_do_the_calculation;
      // html += liSpan(value: htmlAdditionNegPos(label: label1, data: numbers, result: answer, startColor: 2));

      // show the result
      String label2 = MathMasterLocale.of(context)!.steps_do_the_calculation;
      html += liSpan(value: _htmlResultAdditionNegPos(numbers, answer, label2, br()));

      // show the result
      String labelResult = MathMasterLocale.of(context)!.steps_therefore_result;
      String question = listNumbersIntToString(data: numbers, separator: plus(), lastSeparator: plus());
      html += liSpan(
          value: showHtmlResult(
            label: labelResult,
            input: tex(value: question),
            result: answer.getValueIText(),
          ));
    } else {
      // -----------------------------
      // CONDITION : -A + -B
      // -----------------------------
      labelRule = MathMasterLocale.of(context)!.steps_use_this_rule;
      html += liSpan(value: _htmlRuleAdditionNegNeg(labelRule));

      // String label = MasterLocalizations.of(context)!.steps_do_the_calculation;
      // html += htmlAdditionNegNeg(label: label, data: numbers, result: answer);

      // show the result
      String label2 = MathMasterLocale.of(context)!.steps_do_the_calculation;
      html += liSpan(value: _htmlResultAdditionNegNeg(numbers, answer, label2, br()));

      // show the result
      String labelResult = MathMasterLocale.of(context)!.steps_therefore_result;
      String question = listNumbersIntToString(data: numbers, separator: plus(), lastSeparator: plus());
      html += liSpan(
          value: showHtmlResult(
            label: labelResult,
            input: tex(value: question),
            result: answer.getValueIText(),
          ));
    }

    return (ol(value: html));
  }

  String htmlAdditionMissingDigit(int idxMissingDigit) {
    String html = "";

    // 1. do the calculation
    String label = MathMasterLocale.of(context)!.steps_do_the_calculation;
    html += htmlAdditionPosPos(label: label, data: [numbers[0], numbers[1]], result: numbers[2]);

    // 2. show the result
    String label2 = MathMasterLocale.of(context)!.steps_therefore_missing_digit;
    html += liSpan(value: showHtmlResult(label: label2, input: "", result: answer.getValueIText()));

    return (ol(value: html));
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
