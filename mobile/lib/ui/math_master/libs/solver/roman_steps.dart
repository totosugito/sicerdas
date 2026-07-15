import 'package:bse/i18n/strings.g.dart';
import '../models/my_number.dart';
import 'libs/html_lib.dart';
import 'roman_lib.dart';

class RomanSteps extends LibHtml {
  late RomanLib lib;

  RomanSteps({required List<MyNumber> numbers, required MyNumber answer})
    : super(numbers, answer) {
    lib = RomanLib();
  }

  String _htmlRomanNumeralTable(String label) {
    String html = span(id: idStepsLabel, value: sprintf(label, [br()]));
    String numberText = t.math_master.number_text;
    String romanText = t.math_master.roman_text;
    // create table header
    String header = thead(
      value: tr(
        value: th(
          value:
              numberText +
              th(value: romanText) +
              th(
                value: th(value: numberText + th(value: romanText)),
              ),
        ),
      ),
    );

    //create table body
    String body = "";
    int nsize = lib.numbers.length;
    int nrow = (nsize / 2).ceil();
    for (int i = nrow - 1; i >= 0; i--) {
      int idx1 = 2 * i;
      int idx2 = idx1 + 1;

      String valNumberL = lib.numbers[idx1].toString();
      String valSymbolL = tex(value: texText(value: lib.numbersSymbol[idx1]));
      String valNumberR = "";
      String valSymbolR = "";
      if (idx2 < nsize) {
        valNumberR = lib.numbers[idx2].toString();
        valSymbolR = tex(value: texText(value: lib.numbersSymbol[idx2]));
      }
      body += tr(
        value:
            "${td(value: valNumberL)}${td(value: valSymbolL)}${td(value: "")}${td(value: valNumberR)}${td(value: valSymbolR)}\n",
      );
    }
    body = tbody(value: body);
    return (html + table(value: header + body, style: "width: 270px"));
  }

  String _htmlSeparateNumberByUnits(
    String label,
    int value,
    List<int> unitGroup,
    List<List<int>> unitGroups,
    List<List<String>> unitSymbols,
  ) {
    String html = span(
      id: idStepsLabel,
      value: sprintf(label, [b(value.toString()), br()]),
    );

    String textGroup =
        tex(
          value: equal() + listIntToString(data: unitGroup, separator: plus()),
        ) +
        br();
    String textGroups =
        tex(
          value:
              equal() +
              listListIntToString(
                data: unitGroups,
                separator1: plus(),
                separator2: plus(),
              ),
        ) +
        br();
    String textSymbols =
        tex(
          value:
              equal() +
              listListStringToString(
                data: unitSymbols,
                separator1: plus(),
                separator2: plus(),
              ),
        ) +
        br();
    String textFinal =
        tex(
          value:
              equal() +
              listListStringToString(data: unitSymbols, showGroup: false),
        ) +
        br();

    html += span(id: idStepsValue, value: textGroup);
    if (textGroup != textGroups) {
      html += span(id: idStepsValue, value: textGroups);
    }
    html += span(id: idStepsValue, value: textSymbols);
    if (textSymbols != textFinal) {
      html += span(id: idStepsValue, value: textFinal);
    }
    return (html);
  }

  String _htmlRomanCharToMathAddition(List<String> roman) {
    int size = roman.length;
    String html = "";
    for (int i = 0; i < size; i++) {
      html += texText(value: roman[i]) + (i < size - 1 ? plus() : "");
    }
    return (html);
  }

  String _htmlRomanIntToMathAddition(List<int> roman) {
    int size = roman.length;
    String html = "";
    for (int i = 0; i < size - 1; i++) {
      html += roman[i].toString() + (roman[i + 1] < 0 ? "" : plus());
    }
    html += roman[size - 1].toString();
    return (html);
  }

  String _htmlSeparateRomanByChar(String label, MyNumber value) {
    String valueRoman = tex(value: value.toString());
    String html = span(
      id: idStepsLabel,
      value: sprintf(label, [b(valueRoman), br()]),
    );

    String romanText = lib.numberToRoman(value.getValI());
    List<String> romanChar = romanText.split('');
    List<int> romanCharVal = lib.romanCharToInt(romanChar);

    String textCharRoman = _htmlRomanCharToMathAddition(romanChar);
    String textCharNumber = _htmlRomanIntToMathAddition(romanCharVal);

    html += tex(value: equal() + textCharRoman) + br();
    html += tex(value: equal() + textCharNumber) + br();
    if (value.getValI().toString() != textCharNumber) {
      html += tex(value: equal() + value.getValI().toString()) + br();
    }

    return (html);
  }

  String _htmlDoTheCalculation(bool isSubtract, String label) {
    String html = span(id: idStepsLabel, value: sprintf(label, [br()]));
    html +=
        equal() +
        tex(
          value:
              numbers[0].toString() +
              (isSubtract ? minus() : plus()) +
              numbers[1].toString(),
        ) +
        br();
    html +=
        equal() +
        tex(
          value:
              numbers[0].getValI().toString() +
              (isSubtract ? minus() : plus()) +
              numbers[1].getValI().toString(),
        ) +
        br();
    html += equal() + tex(value: answer.getValI().toString()) + br();
    return (html);
  }

  String htmlNumberToRoman() {
    String html = "";

    if (numbers.isEmpty) {
      return (t.math_master.solver.steps_no_solution);
    }

    int value = numbers[0].getValI();
    List<int> unitGroup = lib.separateIntByUnitGroup(
      value,
    ); // separate number by units. ex. 1203 = [1000, 200, 3]
    List<List<int>> unitGroups = lib.listNumberToRomanGroup(unitGroup);
    List<List<String>> unitSymbols = lib.listNumberToRomanSymbol(unitGroups);

    // 1. create table roman numerals
    String label1 = t.math_master.steps_roman_2;
    html += liSpan(value: _htmlRomanNumeralTable(label1));

    // 2. separate number by units. ex. abc = a + b + c
    String label2 = t.math_master.steps_roman_3;
    html += liSpan(
      value: _htmlSeparateNumberByUnits(
        label2,
        value,
        unitGroup,
        unitGroups,
        unitSymbols,
      ),
    );

    // 3. final result
    String label3 = t.math_master.steps_roman_4;
    String result = tex(
      value: listListStringToString(data: unitSymbols, showGroup: false),
    );
    html += liSpan(
      value: showHtmlResult(
        label: label3,
        input: b(tex(value: value.toString())),
        result: result,
      ),
    );

    return (ol(value: html));
  }

  String htmlRomanToNumber() {
    String html = "";

    if (numbers.isEmpty) {
      return (t.math_master.solver.steps_no_solution);
    }

    int value = numbers[0].getValI();
    String valueRoman = tex(value: numbers[0].toString());

    // 1. create table roman numerals
    String label1 = t.math_master.steps_roman_2;
    html += liSpan(value: _htmlRomanNumeralTable(label1));

    // 2. separate number by units. ex. abc = a + b + c
    String label2 = t.math_master.steps_roman_6;
    html += liSpan(value: _htmlSeparateRomanByChar(label2, numbers[0]));

    // 3. final result
    String label3 = t.math_master.steps_roman_7;
    html += liSpan(
      value: showHtmlResult(
        label: label3,
        input: b(valueRoman),
        result: value.toString(),
      ),
    );

    return (ol(value: html));
  }

  String htmlRomanCalc(bool isSubtract) {
    String html = "";

    if (numbers.isEmpty) {
      return (t.math_master.solver.steps_no_solution);
    }

    // 1. create table roman numerals
    String label1 = t.math_master.steps_roman_2;
    html += liSpan(value: _htmlRomanNumeralTable(label1));

    // 2. convert roman 1 to number
    String label2 = t.math_master.steps_roman_9;
    html += liSpan(value: _htmlSeparateRomanByChar(label2, numbers[0]));

    // 3. convert roman 2 to number
    String label3 = t.math_master.steps_roman_9;
    html += liSpan(value: _htmlSeparateRomanByChar(label3, numbers[1]));

    // 4. calculate
    String label4 = t.math_master.steps_do_the_calculation;
    html += liSpan(value: _htmlDoTheCalculation(isSubtract, label4));

    // 5. final result
    String label5 = t.math_master.steps_roman_8;
    String qq = tex(
      value:
          numbers[0].toString() +
          (isSubtract ? minus() : plus()) +
          numbers[1].toString(),
    );
    html += liSpan(
      value: showHtmlResult(
        label: label5,
        input: b(qq),
        result: answer.getValI().toString(),
      ),
    );

    return (ol(value: html));
  }
}
