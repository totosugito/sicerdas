import 'package:flutter/material.dart';
import 'libs/html_lib.dart';
import 'libs/calculator_lib.dart';

class CalcSteps extends LibHtml {
  late CalculatorLib lib;

  CalcSteps(super.numbers, super.answer) {
    lib = CalculatorLib();
  }

  String _texAdditionSteps({
    required List<List<String>> data,
    String spacing = "\\space",
    bool header = true,
    int start = 1,
    end = -1,
    String symbol = "+",
    int startColor = 0,
  }) {
    String result = "";

    String calcSymbol = texSmall(value: symbol);
    String calcSymbolPhantom = texSmall(value: texPhantom(value: symbol));

    // create header
    String strItem = spacing;
    if (header) {
      List<String> item = data[0];
      for (int j = 0; j < item.length; j++) {
        String str = item[j].trim().isNotEmpty
            ? item[j]
            : texPhantom(value: "0");
        strItem +=
            texSmall(
              value: texColor(value: str, color: Colors.grey),
            ) +
            spacing;
      }
      result += strItem + calcSymbolPhantom + texBr();
    }

    // data
    end = end > 0 ? end : data.length;
    for (int i = start; i < end; i++) {
      strItem = spacing;
      List<String> item = data[i];
      for (int j = 0; j < item.length; j++) {
        String str = item[j].trim().isNotEmpty
            ? item[j]
            : texPhantom(value: "0");
        strItem +=
            texColor(value: str, color: autoColor[startColor + j]) + spacing;
      }

      // add horizontal line
      if (i == end - 2) {
        result += strItem + calcSymbol + texBr();
        result += (i == end - 2) ? texHline() : "";
      } else {
        result += strItem + calcSymbolPhantom + texBr();
      }
    }
    return (texMatrix(value: result));
  }

  String _texSubtractionSteps({
    required List<List<String>> data,
    String spacing = "\\space",
    bool header = true,
    int start = 1,
    end = -1,
    String symbol = "+",
    int startColor = 0,
  }) {
    String result = "";

    String calcSymbol = texFootNote(value: symbol);
    String calcSymbolPhantom = texFootNote(value: texPhantom(value: symbol));

    // create header
    String strItem = spacing;
    if (header) {
      List<String> item = data[0];
      for (int j = 0; j < item.length; j++) {
        String str = item[j].trim().isNotEmpty
            ? item[j]
            : texPhantom(value: "0");
        strItem += texColor(value: str, color: Colors.grey) + spacing;
      }
      result += strItem + calcSymbolPhantom + texBr();
    }

    // data
    end = end > 0 ? end : data.length;
    for (int i = start; i < end; i++) {
      strItem = spacing;
      List<String> item = data[i];
      for (int j = 0; j < item.length; j++) {
        String str = "";
        if (i == start) {
          str = data[0][j].trim().isNotEmpty
              ? texCancel(value: item[j])
              : item[j].trim().isNotEmpty
              ? item[j]
              : texPhantom(value: "0");
        } else {
          str = item[j].trim().isNotEmpty ? item[j] : texPhantom(value: "0");
        }
        strItem +=
            texColor(value: str, color: autoColor[startColor + j]) + spacing;
      }

      // add horizontal line
      if (i == end - 2) {
        result += strItem + calcSymbol + texBr();
        result += (i == end - 2) ? texHline() : "";
      } else {
        result += strItem + calcSymbolPhantom + texBr();
      }
    }
    return (texMatrix(value: result));
  }

  String htmlAdditionDigit({
    required String label,
    required List<List<String>> data,
    int startColor = 0,
  }) {
    String htmlLabel = span(
      id: idStepsLabel,
      value: sprintf(label, ["\n"]) + br(),
    );

    String html = "";
    if (label.isNotEmpty) {}

    bool haveHeader = lib.isEmpty(data: data, irow: 0);
    html += tex(
      value: _texAdditionSteps(
        data: data,
        header: !haveHeader,
        spacing: "&",
        symbol: plus(spacing: ""),
        startColor: startColor,
      ),
    );
    return (htmlLabel + html);
  }

  String htmlSubtractionDigit({
    required String label,
    required List<List<String>> data,
    int startColor = 0,
  }) {
    String htmlLabel = span(
      id: idStepsLabel,
      value: sprintf(label, ["\n"]) + br(),
    );

    String html = "";
    if (label.isNotEmpty) {}

    bool haveHeader = lib.isEmpty(data: data, irow: 0);
    html += tex(
      value: _texSubtractionSteps(
        data: data,
        header: !haveHeader,
        spacing: "&",
        symbol: minus(spacing: ""),
        startColor: startColor,
      ),
    );
    return (htmlLabel + html);
  }

  String listStringToTexRow({
    required List<String> data,
    bool isAutoColor = false,
    int idxAutoColor = 0,
    Color color = Colors.black,
    String spacing = "\\space",
  }) {
    String text = "";
    for (int j = 0; j < data.length; j++) {
      String str = data[j].trim().isNotEmpty ? data[j] : texPhantom(value: "0");
      if (isAutoColor) {
        text +=
            texColor(value: str, color: autoColor[idxAutoColor + j]) + spacing;
      } else {
        text += texColor(value: str, color: color) + spacing;
      }
    }
    return (text);
  }

  String listStringToTexRowWithSelectedColor({
    required List<String> data,
    int idxColor = 0,
    Color color1 = Colors.black,
    Color color2 = Colors.black,
    String spacing = "\\space",
  }) {
    String text = "";
    int selectedColor = data.length - 1 - idxColor;
    for (int j = 0; j < data.length; j++) {
      String str = data[j].trim().isNotEmpty ? data[j] : texPhantom(value: "0");
      text +=
          texColor(value: str, color: j == selectedColor ? color2 : color1) +
          spacing;
    }
    return (text);
  }

  String htmlMultiplicationStep({
    required String label,
    required List<List<String>> data,
    bool lastStep = false,
    int step = 0,
    int startColor = 0,
  }) {
    String htmlLabel = span(
      id: idStepsLabel,
      value: sprintf(label, ["\n"]) + br(),
    );

    String html = "";
    if (label.isNotEmpty) {}

    String mulSymbol = texSmall(value: texTimes());
    String mulSymbolPhantom = texSmall(value: texPhantom(value: texTimes()));
    String addSymbol = texSmall(value: plus());
    String addSymbolPhantom = texSmall(value: texPhantom(value: plus()));
    Color color = autoColor[0];
    Color colorDefault = Colors.black;
    String spacing = "\\space";
    if (lastStep) {
      // --- show header from last steps ---
      List<String> currentStepHeader = data[2 * step];
      bool noStepHeader = lib.isEmpty(data: data, irow: 2 * step);
      html += noStepHeader
          ? ""
          : listStringToTexRow(
                  data: currentStepHeader,
                  isAutoColor: false,
                  idxAutoColor: 0,
                  color: Colors.grey,
                  spacing: spacing,
                ) +
                mulSymbolPhantom +
                texBr();

      html +=
          listStringToTexRow(
            data: data[0],
            isAutoColor: false,
            idxAutoColor: 0,
            color: colorDefault,
            spacing: spacing,
          ) +
          mulSymbolPhantom +
          texBr();
      html +=
          listStringToTexRowWithSelectedColor(
            data: data[1],
            idxColor: step,
            color1: colorDefault,
            color2: colorDefault,
            spacing: spacing,
          ) +
          mulSymbol +
          texBr();
      html += texHline();

      // adding multiplication from previous steps
      for (int i = 1; i <= step; i++) {
        if (i == step) {
          html += texHline();
        }
        html +=
            listStringToTexRow(
              data: data[2 * i + 1],
              isAutoColor: true,
              idxAutoColor: 0,
              color: colorDefault,
              spacing: spacing,
            ) +
            (i == step - 1 ? addSymbol : addSymbolPhantom) +
            texBr();
      }
    } else {
      // --- show header from current steps
      List<String> currentStepHeader = data[2 * step];
      bool noStepHeader = lib.isEmpty(data: data, irow: 2 * step);
      html += noStepHeader
          ? ""
          : listStringToTexRow(
                  data: currentStepHeader,
                  isAutoColor: false,
                  idxAutoColor: 0,
                  color: Colors.grey,
                  spacing: spacing,
                ) +
                mulSymbolPhantom +
                texBr();

      // --- show question ---
      html +=
          listStringToTexRow(
            data: data[0],
            isAutoColor: false,
            idxAutoColor: 0,
            color: color,
            spacing: spacing,
          ) +
          mulSymbolPhantom +
          texBr(); // numbers[0]
      html +=
          listStringToTexRowWithSelectedColor(
            data: data[1],
            idxColor: step - 1,
            color1: colorDefault,
            color2: color,
            spacing: spacing,
          ) +
          mulSymbol +
          texBr(); // numbers[1]
      html += texHline();

      // --- adding multiplication from previous steps ---
      for (int i = 1; i < step; i++) {
        html +=
            listStringToTexRow(
              data: data[2 * i + 1],
              isAutoColor: false,
              idxAutoColor: step,
              color: colorDefault,
              spacing: spacing,
            ) +
            addSymbolPhantom +
            texBr();
      }

      // --- add current steps ---
      html +=
          listStringToTexRow(
            data: data[2 * step + 1],
            isAutoColor: false,
            idxAutoColor: step,
            color: color,
            spacing: spacing,
          ) +
          addSymbolPhantom +
          texBr();
    }
    return (htmlLabel + tex(value: texMatrix(value: html)));
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
