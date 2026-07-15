import 'package:flutter/material.dart';

import '../../models/my_number.dart';

class LibHtml {
  final List<MyNumber> numbers;
  final MyNumber answer;
  final List<Color> autoColor = [
    Colors.blue,
    Colors.red,
    Colors.green,
    Colors.orange,
    Colors.purple,
    Colors.deepOrange,
    Colors.cyan,
    Colors.pink,
    Colors.teal,
    Colors.brown,
  ];

  LibHtml(this.numbers, this.answer);

  String htmlSpacing = "&nbsp;";
  String idStepsLabel = "steps-label";
  String idStepsValue = "steps-value";
  String idLiSpan = "li-span";
  String idFinalAnswer = "final-answer";
  String idQuestionLabel = "div-question-label";

  String plus({String spacing = " "}) {
    return ("$spacing+$spacing");
  }

  String asterisk({String spacing = " "}) {
    return ("$spacing*$spacing");
  }

  String times({String spacing = " "}) {
    return ("$spacing&#215;$spacing");
  }

  String equal({String spacing = " "}) {
    return ("$spacing=$spacing");
  }

  String minus({String spacing = " "}) {
    return ("$spacing-$spacing");
  }

  String divide({String spacing = " "}) {
    return ("$spacing:$spacing");
  }

  String duplicate(String text, int n) {
    String result = "";
    for (int i = 0; i < n; i++) {
      result += text;
    }
    return (result);
  }

  String parenthesis({String value = ""}) {
    return ("($value)");
  }

  String nSpace(int n) {
    return (duplicate(htmlSpacing, n));
  }

  String tag({
    required String tag,
    required String value,
    String id = "",
    String style = "",
    bool newline = true,
  }) {
    String strId = id.isEmpty ? '' : 'class="$id"';
    String strStyle = style.isEmpty ? '' : 'style="$style"';
    return ('<$tag $strId $strStyle>$value</$tag> ${newline ? "\n" : ""}');
  }

  // ----------------- GENERAL ----------------
  String br() {
    return ('<br/>\n');
  }

  String image({required String value, String style = ""}) {
    return ('<img class="img-fluid" src="$value" style="$style" alt="image"/>');
  }

  String h3({
    required String value,
    String id = "",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "h3",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  String h4({
    required String value,
    String id = "",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "h4",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  String div({
    required String value,
    String id = "",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "div",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  String span({
    required String value,
    String id = "",
    String style = "",
    bool newline = false,
  }) {
    return (tag(
      tag: "span",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  String b(String value) {
    return (tag(tag: "b", value: value, newline: false));
  }

  String spacing(String value) {
    return (" $value ");
  }

  String li({
    required String value,
    String id = "",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "li",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  String liSpan({
    required String value,
    String id = "",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "li",
      value: tag(
        tag: "span",
        value: value,
        id: id,
        style: style,
        newline: false,
      ),
      newline: newline,
    ));
  }

  String ol({
    required String value,
    String id = "",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "ol",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  String sup(String value) {
    return (tag(tag: "sup", value: value, newline: false));
  }

  String sub(String value) {
    return (tag(tag: "sub", value: value, newline: false));
  }

  // ----------------- TABLE ----------------
  String table({
    required String value,
    String id = "table table-sm table-bordered table-striped text-center",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "table",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  String thead({
    required String value,
    String id = "table-dark",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "thead",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  String tbody({
    required String value,
    String id = "",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "tbody",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  String th({
    required String value,
    String id = "",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "th",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  String td({
    required String value,
    String id = "",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "td",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  String tr({
    required String value,
    String id = "",
    String style = "",
    bool newline = true,
  }) {
    return (tag(
      tag: "tr",
      value: value,
      id: id,
      style: style,
      newline: newline,
    ));
  }

  // ----------------- LATEX ----------------
  String tex({required String value}) {
    return ('\$$value\$');
  }

  String texTimes() {
    return ('\\times');
  }

  String texHline() {
    return ('\\hline');
  }

  String texSpace() {
    return ('\\space');
  }

  String texPercent() {
    return ('\\%');
  }

  String texLdots() {
    return ('\\ldots');
  }

  String texText({required String value}) {
    return ('\\text{$value}');
  }

  String texBold({required String value}) {
    return ('\\bold{$value}');
  }

  String texPhantom({required String value}) {
    return ('\\phantom{$value}');
  }

  String texNormalSize({required String value}) {
    return ("\\normalsize${value.isEmpty ? "" : "{$value}"}");
  }

  String texSmall({required String value}) {
    return ("\\small${value.isEmpty ? "" : "{$value}"}");
  }

  String texFootNote({required String value}) {
    return ("\\footnotesize${value.isEmpty ? "" : "{$value}"}");
  }

  String texScriptSize({required String value}) {
    return ("\\scriptsize${value.isEmpty ? "" : "{$value}"}");
  }

  String texTiny({required String value}) {
    return ("\\tiny${value.isEmpty ? "" : "{$value}"}");
  }

  String texUnderline({required String value}) {
    return ('\\underline{$value}');
  }

  String texCancel({required String value}) {
    return ('\\cancel{$value}');
  }

  String texFrac({
    String value = "",
    required String numerator,
    required String denominator,
  }) {
    return ('$value\\frac{$numerator}{$denominator}');
  }

  String texAligned({required String value}) {
    return ('\\begin{aligned}$value\\end{aligned}');
  }

  String texFbox({required String value}) {
    return ('\\fbox{$value}');
  }

  String texGathered({required String value}) {
    return ('\\begin{gathered}$value\\end{gathered}');
  }

  String texBr({
    String value = "\\\\",
    bool isNormal = true,
    String spacing = "[0.5em]",
  }) {
    return (isNormal ? value : "$value$spacing");
  }

  String texEqual({bool isAlign = true}) {
    return (isAlign ? "&=" : "=");
  }

  String texColor({required String value, Color color = Colors.black}) {
    if (color == Colors.black) {
      return ("{$value}");
    } else {
      return ("\\textcolor{#${color.toARGB32().toRadixString(16).substring(2)}}{$value}");
    }
  }

  String texMatrix({required String value}) {
    return ("\\begin{matrix}$value\\end{matrix}");
  }

  String texArray({required String value, String arraySymbol = "r"}) {
    return ("\\begin{array}{$arraySymbol}$value\\end{array}");
  }

  int listLength({required List<int> data, int start = 0, int spacing = 1}) {
    int len = 0;
    int size = data.length;
    for (int i = start; i < size; i += spacing) {
      len += 1;
    }
    return (len);
  }

  String listIntToString({
    required List<int> data,
    String separator = "",
    int start = 0,
    int spacing = 1,
  }) {
    String text = "";
    int size = data.length;
    for (int i = start; i < size; i += spacing) {
      text += i < size - spacing
          ? data[i].toString() + separator
          : data[i].toString();
    }
    return (text);
  }

  String listListIntToString({
    required List<List<int>> data,
    String separator1 = "",
    String separator2 = "",
  }) {
    String text = "";
    int size = data.length;
    for (int i = 0; i < size; i++) {
      List<int> item = data[i];
      int sizeItem = item.length;
      String strItem = "";
      for (int j = 0; j < sizeItem; j++) {
        strItem += j < sizeItem - 1
            ? item[j].toString() + separator2
            : item[j].toString();
      }
      if (sizeItem > 1) {
        strItem = "($strItem)";
      }
      text += i < size - 1 ? strItem + separator1 : strItem;
    }
    return (text);
  }

  String listListStringToString({
    required List<List<String>> data,
    bool isTexText = true,
    bool showGroup = true,
    String separator1 = "",
    String separator2 = "",
  }) {
    String text = "";
    int size = data.length;
    for (int i = 0; i < size; i++) {
      List<String> item = data[i];
      int sizeItem = item.length;
      String strItem = "";
      for (int j = 0; j < sizeItem; j++) {
        strItem += j < sizeItem - 1 ? item[j] + separator2 : item[j].toString();
      }
      if (sizeItem > 1) {
        strItem = showGroup ? "($strItem)" : strItem;
      }
      text += i < size - 1 ? strItem + separator1 : strItem;
    }

    return (isTexText ? texText(value: text) : text);
  }

  String listNumbersIntToString({
    required List<MyNumber> data,
    bool negativeGroup = true,
    String separator = ", ",
    String lastSeparator = ", ",
  }) {
    String text = "";
    int size = data.length;

    text = data[0].value.toString();
    for (int i = 1; i < size; i++) {
      String textItem = (negativeGroup && data[i].isNegative())
          ? parenthesis(value: data[i].getValueIText())
          : data[i].getValueIText();
      text += i < size - 1 ? separator + textItem : lastSeparator + textItem;
    }
    return (text);
  }

  String mapRankIntToString({
    required Map<int, int> data,
    String separator = "",
    bool showAll = false,
  }) {
    String text = "";
    data.forEach((key, value) {
      if (showAll) {
        text += key.toString() + sup(value.toString()) + separator;
      } else {
        text += value != 1
            ? key.toString() + sup(value.toString()) + separator
            : key.toString() + separator;
      }
    });

    return (text.substring(0, text.length - separator.length));
  }

  String divQuestionLabel({required String text}) {
    return (div(value: text, id: idQuestionLabel));
  }

  String showHtmlResult({
    required String label,
    required String input,
    required String result,
  }) {
    String html = span(id: idStepsLabel, value: sprintf(label, [input, br()]));
    html += span(id: idFinalAnswer, value: result);
    return (html);
  }

  String createHtmlBadge(String topic, String module) {
    return ('<span class="badge text-bg-primary">$topic</span> <span class="badge text-bg-warning">$module</span>');
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
