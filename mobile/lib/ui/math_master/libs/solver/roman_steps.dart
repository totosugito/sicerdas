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
    String htmlLabel = span(id: idStepsLabel, value: sprintf(label, [br()]));
    String numberText = t.math_master.number_text;
    String romanText = t.math_master.roman_text;

    String headerRow =
        '''
      <tr>
        <th class="roman-th">$numberText</th>
        <th class="roman-th">$romanText</th>
        <th style="width: 20px; background-color: transparent; border: none;"></th>
        <th class="roman-th">$numberText</th>
        <th class="roman-th">$romanText</th>
      </tr>
    ''';

    String bodyRows = "";
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

      String trClass = (i % 2 == 0) ? "roman-tr-even" : "roman-tr-odd";

      bodyRows +=
          '''
        <tr class="$trClass">
          <td class="roman-td-num">$valNumberL</td>
          <td class="roman-td-sym">$valSymbolL</td>
          <td style="background-color: transparent; border: none;"></td>
          <td class="roman-td-num">$valNumberR</td>
          <td class="roman-td-sym">$valSymbolR</td>
        </tr>
      ''';
    }

    String tableHtml =
        '''
      <table class="roman-table">
        <thead>
          $headerRow
        </thead>
        <tbody>
          $bodyRows
        </tbody>
      </table>
    ''';

    return (htmlLabel + tableHtml);
  }

  String _arrowSvg({String color = "#94a3b8", double size = 16}) {
    return '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="$color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: ${size}px; height: ${size}px; display: inline-block; vertical-align: middle; margin: 0 4px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
''';
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

    String cards =
        '<div style="margin: 12px 0; display: flex; flex-direction: column; gap: 8px; max-width: 320px;">';
    for (int i = 0; i < unitGroup.length; i++) {
      int val = unitGroup[i];
      if (val == 0) continue;
      String roman = lib.numberToRoman(val);

      String detail = "";
      if (unitGroups[i].length > 1) {
        String breakdownMath = unitGroups[i]
            .map((e) => e.toString())
            .join(" + ");
        String breakdownRoman = unitSymbols[i].join(" + ");
        String detailArrow = _arrowSvg(color: "#cbd5e1", size: 12);
        detail =
            '<span style="font-size: 12px; color: #64748b; margin-left: 8px;">($breakdownMath $detailArrow $breakdownRoman)</span>';
      }

      String cardArrow = _arrowSvg(color: "#3b82f6", size: 16);
      cards +=
          '''
  <div class="roman-card">
    <div>
      <span class="roman-card-val">$val</span>
      $detail
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      $cardArrow
      <span class="roman-card-roman">$roman</span>
    </div>
  </div>
''';
    }
    cards += '</div>';

    String textFinal =
        tex(
          value:
              equal() +
              listListStringToString(data: unitSymbols, showGroup: false),
        ) +
        br();

    html += cards;
    html += span(id: idStepsValue, value: textFinal);
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

    String cards =
        '<div style="margin: 12px 0; display: flex; flex-direction: column; gap: 8px; max-width: 320px;">';
    for (int i = 0; i < romanChar.length; i++) {
      String char = romanChar[i];
      int val = romanCharVal[i];

      bool isNegative = val < 0;
      String cardClass = isNegative ? "roman-neg-card" : "roman-pos-card";
      String textClass = isNegative ? "roman-neg-text" : "roman-pos-text";

      cards +=
          '''
  <div class="$cardClass">
    <div>
      <span style="font-weight: 700; color: var(--text-heading); font-size: 16px;">$char</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <span class="$textClass">${isNegative ? '-' : '+'}</span>
      <span class="$textClass">${val.abs()}</span>
    </div>
  </div>
''';
    }
    cards += '</div>';

    String textCharNumber = _htmlRomanIntToMathAddition(romanCharVal);
    html += cards;
    html += tex(value: equal() + textCharNumber) + br();
    if (value.getValI().toString() != textCharNumber) {
      html += tex(value: equal() + value.getValI().toString()) + br();
    }

    return (html);
  }

  String _htmlDoTheCalculation(bool isSubtract, String label) {
    String html = span(id: idStepsLabel, value: sprintf(label, [br()]));
    html +=
        br() +
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
