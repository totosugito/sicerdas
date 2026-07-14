import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../models/my_number.dart';
import 'libs/html_lib.dart';

class FractionSteps extends LibHtml {
  FractionSteps({required List<MyNumber> numbers, required MyNumber answer})
    : super(numbers, answer);

  String htmlCalcTwoFractions({
    required MyNumber number1,
    required MyNumber number2,
    required String calcSymbol,
    Color colorNum1 = Colors.green,
    Color colorDen1 = Colors.red,
    Color colorNum2 = Colors.blue,
    Color colorDen2 = Colors.purple,
  }) {
    String html =
        texFrac(
          numerator: texColor(value: number1.getNumText(), color: colorNum1),
          denominator: texColor(value: number1.getDenText(), color: colorDen1),
        ) +
        calcSymbol +
        texFrac(
          numerator: texColor(value: number2.getNumText(), color: colorNum2),
          denominator: texColor(value: number2.getDenText(), color: colorDen2),
        );
    return (html);
  }

  String _htmlRuleFracFromMixed(String label) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();

    String html = "";
    html +=
        texColor(value: "a", color: Colors.green) +
        texFrac(
          numerator: texColor(value: "b", color: Colors.purple),
          denominator: texColor(value: "c", color: Colors.red),
        ) +
        texEqual() +
        texFrac(
          numerator:
              texColor(value: "c", color: Colors.red) +
              times() +
              texColor(value: "a", color: Colors.green) +
              plus() +
              texColor(value: "b", color: Colors.purple),
          denominator: texColor(value: "c", color: Colors.red),
        ) +
        texBr(isNormal: true); // 8(2/6) = (6*8+2)/6

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlRuleFracAdditionAndSubtraction(String label, String symbol) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();
    String html = "";
    html +=
        texFrac(
          numerator: texColor(value: "a", color: Colors.green),
          denominator: texColor(value: "b", color: Colors.red),
        ) +
        symbol +
        texFrac(
          numerator: texColor(value: "c", color: Colors.blue),
          denominator: texColor(value: "d", color: Colors.purple),
        );

    html +=
        texEqual() +
        texFrac(
          numerator:
              parenthesis(
                value:
                    texColor(value: "a", color: Colors.green) +
                    texTimes() +
                    texColor(value: "d", color: Colors.purple),
              ) +
              symbol +
              parenthesis(
                value:
                    texColor(value: "c", color: Colors.blue) +
                    texTimes() +
                    texColor(value: "b", color: Colors.red),
              ),
          denominator:
              texColor(value: "b", color: Colors.red) +
              texTimes() +
              texColor(value: "d", color: Colors.purple),
        ) +
        texBr(isNormal: false);

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlRuleFracMultiplication(String label) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();
    String html = "";
    html +=
        texFrac(
          numerator: texColor(value: "a", color: Colors.green),
          denominator: texColor(value: "b", color: Colors.red),
        ) +
        texTimes() +
        texFrac(
          numerator: texColor(value: "c", color: Colors.blue),
          denominator: texColor(value: "d", color: Colors.purple),
        );

    html +=
        texEqual() +
        texFrac(
          numerator:
              texColor(value: "a", color: Colors.green) +
              texTimes() +
              texColor(value: "c", color: Colors.blue),
          denominator:
              texColor(value: "b", color: Colors.red) +
              texTimes() +
              texColor(value: "d", color: Colors.purple),
        ) +
        texBr(isNormal: false);

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlRuleFracSameDenominator(String label, String symbol) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();
    String html = "";
    html +=
        texFrac(
          numerator: texColor(value: "a", color: Colors.green),
          denominator: texColor(value: "b", color: Colors.red),
        ) +
        symbol +
        texFrac(
          numerator: texColor(value: "c", color: Colors.blue),
          denominator: texColor(value: "b", color: Colors.red),
        );

    html +=
        texEqual() +
        texFrac(
          numerator:
              texColor(value: "a", color: Colors.green) +
              symbol +
              texColor(value: "c", color: Colors.blue),
          denominator: texColor(value: "b", color: Colors.red),
        ) +
        texBr(isNormal: false);

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlRuleFracDivision(String label) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();
    String html = "";
    html +=
        texFrac(
          numerator: texColor(value: "a", color: Colors.green),
          denominator: texColor(value: "b", color: Colors.red),
        ) +
        divide() +
        texFrac(
          numerator: texColor(value: "c", color: Colors.blue),
          denominator: texColor(value: "d", color: Colors.purple),
        );

    html +=
        texEqual() +
        texFrac(
          numerator: texColor(value: "a", color: Colors.green),
          denominator: texColor(value: "b", color: Colors.red),
        ) +
        texTimes() +
        texFrac(
          numerator: texColor(value: "d", color: Colors.purple),
          denominator: texColor(value: "c", color: Colors.blue),
        ) +
        texBr(isNormal: false);

    html +=
        texEqual() +
        texFrac(
          numerator:
              texColor(value: "a", color: Colors.green) +
              texTimes() +
              texColor(value: "d", color: Colors.purple),
          denominator:
              texColor(value: "b", color: Colors.red) +
              texTimes() +
              texColor(value: "c", color: Colors.blue),
        ) +
        texBr(isNormal: false);

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlFractionsFromMixed(
    String label,
    MyNumber input,
    MyNumber improper,
  ) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();

    String html = "";
    html +=
        texColor(value: input.getValueIText(), color: Colors.green) +
        texFrac(
          numerator: texColor(value: input.getNumText(), color: Colors.purple),
          denominator: texColor(value: input.getDenText(), color: Colors.red),
        ) +
        texEqual() +
        texFrac(
          numerator:
              texColor(value: input.getDenText(), color: Colors.red) +
              times() +
              texColor(value: input.getValueIText(), color: Colors.green) +
              plus() +
              texColor(value: input.getNumText(), color: Colors.purple),
          denominator: texColor(value: input.getDenText(), color: Colors.red),
        ) +
        texBr(isNormal: true); // 8(2/6) = (6*8+2)/6

    html +=
        texEqual() +
        texFrac(
          numerator: improper.getNumText(),
          denominator: improper.getDenText(),
        ) +
        texBr(isNormal: true);

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlFractionsToMixed(String label, MyNumber input, MyNumber output) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();
    String html = "";

    html +=
        (input.getValI() > 0
            ? texColor(value: input.getValueIText(), color: Colors.green)
            : "") +
        texFrac(
          numerator: texColor(value: input.getNumText(), color: Colors.purple),
          denominator: texColor(value: input.getDenText(), color: Colors.red),
        ) +
        texEqual() +
        texColor(value: output.getValueIText(), color: Colors.green) +
        texText(value: spacing(t.math_master.solver.remainder_of_text)) +
        texColor(value: output.getNumText(), color: Colors.blue) +
        texBr(isNormal: true); // 38/7 = 5 sisa 3

    html +=
        texEqual() +
        texColor(value: output.getValueIText(), color: Colors.green) +
        texFrac(
          numerator: texColor(value: output.getNumText(), color: Colors.blue),
          denominator: texColor(value: output.getDenText(), color: Colors.red),
        ) +
        texBr(isNormal: true); // 5(3/7)

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlToSimplestForm(String label, MyNumber input, MyNumber output) {
    int fpb = input.getNum() ~/ output.getNum();
    if (fpb <= 1) {
      return ("");
    }
    String htmlLabel =
        span(
          id: idStepsLabel,
          value: sprintf(label, [
            input.getNumText(),
            input.getDenText(),
            fpb.toString(),
            fpb.toString(),
          ]),
        ) +
        br();

    String html = "";
    html +=
        texEqual() +
        (input.getValI() > 0 ? texColor(value: input.getValueIText()) : "") +
        texFrac(
          numerator:
              input.getNumText() +
              divide() +
              texColor(value: fpb.toString(), color: Colors.orange),
          denominator:
              input.getDenText() +
              divide() +
              texColor(value: fpb.toString(), color: Colors.orange),
        ) +
        texBr(isNormal: false); // 10/100 * 200

    html += texEqual() + output.toString(); // 1/10
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlFractionsCalc(
    String label,
    MyNumber number1,
    MyNumber number2,
    String calcSymbol,
    MyNumber result,
  ) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();

    String html = "";
    html += htmlCalcTwoFractions(
      number1: number1,
      number2: number2,
      calcSymbol: calcSymbol,
    ); // a/b + c/d

    html +=
        texEqual() +
        texFrac(
          numerator:
              parenthesis(
                value:
                    texColor(value: number1.getNumText(), color: Colors.green) +
                    texTimes() +
                    texColor(value: number2.getDenText(), color: Colors.purple),
              ) +
              calcSymbol +
              parenthesis(
                value:
                    texColor(value: number2.getNumText(), color: Colors.blue) +
                    texTimes() +
                    texColor(value: number1.getDenText(), color: Colors.red),
              ),
          denominator:
              texColor(value: number1.getDenText(), color: Colors.red) +
              texTimes() +
              texColor(value: number2.getDenText(), color: Colors.purple),
        ) +
        texBr(isNormal: false); // // = (a*d + c*b) / b*d

    html +=
        texEqual() +
        texFrac(
          numerator:
              ((number1.getNum() * number2.getDen()).toString() +
              calcSymbol +
              (number2.getNum() * number1.getDen()).toString()),
          denominator: result.getDenText(),
        ) +
        texBr(isNormal: false);

    html +=
        texEqual() +
        texFrac(
          numerator: result.getNumText(),
          denominator: result.getDenText(),
        );
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlFractionsMultiply(
    String label,
    MyNumber number1,
    MyNumber number2,
    String calcSymbol,
    MyNumber result,
  ) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();

    String html = "";
    html += htmlCalcTwoFractions(
      number1: number1,
      number2: number2,
      calcSymbol: calcSymbol,
    ); // a/b + c/d

    html +=
        texEqual() +
        texFrac(
          numerator:
              texColor(value: number1.getNumText(), color: Colors.green) +
              texTimes() +
              texColor(value: number2.getNumText(), color: Colors.blue),
          denominator:
              texColor(value: number1.getDenText(), color: Colors.red) +
              texTimes() +
              texColor(value: number2.getDenText(), color: Colors.purple),
        ) +
        texBr(isNormal: false); // // = a*b / c*d

    html +=
        texEqual() +
        texFrac(
          numerator: result.getNumText(),
          denominator: result.getDenText(),
        );
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlFractionsSameDenominatorCalc(
    String label,
    MyNumber number1,
    MyNumber number2,
    String calcSymbol,
    MyNumber result,
  ) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();

    String html = "";
    html += htmlCalcTwoFractions(
      number1: number1,
      number2: number2,
      calcSymbol: calcSymbol,
      colorDen1: Colors.red,
      colorDen2: Colors.red,
    ); // a/b + c/b

    html +=
        texEqual() +
        texFrac(
          numerator:
              texColor(value: number1.getNumText(), color: Colors.green) +
              calcSymbol +
              texColor(value: number2.getNumText(), color: Colors.blue),
          denominator: texColor(value: number1.getDenText(), color: Colors.red),
        ) +
        texBr(isNormal: false); // = (a + c) / b

    html +=
        texEqual() +
        texFrac(
          numerator: result.getNumText(),
          denominator: result.getDenText(),
        );
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlFractionsDivision(
    String label,
    MyNumber number1,
    MyNumber number2,
    String calcSymbol,
    MyNumber result,
  ) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();

    String html = "";
    html += htmlCalcTwoFractions(
      number1: number1,
      number2: number2,
      calcSymbol: calcSymbol,
    ); // a/b : c/d

    html +=
        texEqual() +
        texFrac(
          numerator: texColor(value: number1.getNumText(), color: Colors.green),
          denominator: texColor(value: number1.getDenText(), color: Colors.red),
        ) +
        texTimes() +
        texFrac(
          numerator: texColor(
            value: number2.getDenText(),
            color: Colors.purple,
          ),
          denominator: texColor(
            value: number2.getNumText(),
            color: Colors.blue,
          ),
        ) +
        texBr(isNormal: false); // = a/b * d/c

    html +=
        texEqual() +
        texFrac(
          numerator:
              texColor(value: number1.getNumText(), color: Colors.green) +
              texTimes() +
              texColor(value: number2.getDenText(), color: Colors.purple),
          denominator:
              texColor(value: number1.getDenText(), color: Colors.red) +
              texTimes() +
              texColor(value: number2.getNumText(), color: Colors.blue),
        ) +
        texBr(isNormal: false); // = a*d / b*c

    html +=
        texEqual() +
        texFrac(
          numerator: result.getNumText(),
          denominator: result.getDenText(),
        );
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String htmlSimplestForm() {
    String html = "";
    // 1. learn about previous module
    String label1 = t.math_master.steps_complete_prev_module(
      module: createHtmlBadge(
        t.math_master.topics_factorization,
        t.math_master.chapter_factorization_gcf,
      ),
      br: br(),
    );
    html += liSpan(
      value: span(id: idStepsLabel, value: label1),
    );

    // 2. to simplest form
    String label2 = t.math_master.solver.steps_fractions_2;
    html += liSpan(value: _htmlToSimplestForm(label2, numbers[0], answer));

    return (ol(value: html));
  }

  String htmlFractionsFromMixed() {
    String html = "";
    // 1. learn about previous module
    String label1 = t.math_master.steps_complete_prev_module(
      module: createHtmlBadge(
        t.math_master.topics_factorization,
        t.math_master.chapter_factorization_gcf,
      ),
      br: br(),
    );
    html += liSpan(
      value: span(id: idStepsLabel, value: label1),
    );

    MyNumber improper = MyNumber.clone(numbers[0]);
    improper.toImproperFractions();

    // 2. do the calculation
    String label4 = t.math_master.solver.use_this_rule;
    html += liSpan(value: _htmlRuleFracFromMixed(label4));

    // 2. do the calculation
    String label2 = t.math_master.solver.do_the_calculation;
    html += liSpan(
      value: _htmlFractionsFromMixed(label2, numbers[0], improper),
    );

    // 3. to simplest form
    String label3 = t.math_master.solver.steps_fractions_2;
    String htmlSimplestForm = _htmlToSimplestForm(label3, improper, answer);
    if (htmlSimplestForm.isNotEmpty) {
      html += liSpan(value: htmlSimplestForm);
    }

    return (ol(value: html));
  }

  String htmlFractionsToMixed() {
    String html = "";
    // 1. learn about previous module
    String label1 = t.math_master.steps_complete_prev_module(
      module: createHtmlBadge(
        t.math_master.topics_division,
        t.math_master.chapter_division_2_digits,
      ),
      br: br(),
    );
    html += liSpan(
      value: span(id: idStepsLabel, value: label1),
    );

    MyNumber mixed = MyNumber.clone(numbers[0]);
    mixed.toMixedFractions();

    // 2. do the calculation
    String label2 = t.math_master.solver.do_the_calculation;
    html += liSpan(value: _htmlFractionsToMixed(label2, numbers[0], mixed));

    // 3. to simplest form
    String label3 = t.math_master.solver.steps_fractions_2;
    String htmlSimplestForm = _htmlToSimplestForm(label3, mixed, answer);
    if (htmlSimplestForm.isNotEmpty) {
      html += liSpan(value: htmlSimplestForm);
    }
    return (ol(value: html));
  }

  String htmlFractionsAddition(String calcSymbol) {
    String html = "";
    // 1. learn about previous module
    String label1 = t.math_master.steps_complete_prev_module(
      module: createHtmlBadge(
        t.math_master.topics_fractions,
        t.math_master.chapter_fractions_simplest_form,
      ),
      br: br(),
    );
    html += liSpan(
      value: span(id: idStepsLabel, value: label1),
    );

    // 2. calculation rule
    String label2 = t.math_master.solver.use_this_rule;

    // 3. do the calculation
    MyNumber fracCalc;
    String label3 = t.math_master.solver.do_the_calculation;
    switch (calcSymbol) {
      case "+":
        if (numbers[0].denominator == numbers[1].denominator) {
          html += liSpan(value: _htmlRuleFracSameDenominator(label2, plus()));
          fracCalc = numbers[0] + numbers[1];
          html += liSpan(
            value: _htmlFractionsSameDenominatorCalc(
              label3,
              numbers[0],
              numbers[1],
              calcSymbol,
              fracCalc,
            ),
          );
        } else {
          html += liSpan(
            value: _htmlRuleFracAdditionAndSubtraction(label2, plus()),
          );
          fracCalc = numbers[0] + numbers[1];
          html += liSpan(
            value: _htmlFractionsCalc(
              label3,
              numbers[0],
              numbers[1],
              calcSymbol,
              fracCalc,
            ),
          );
        }
        break;
      case "-":
        if (numbers[0].denominator == numbers[1].denominator) {
          html += liSpan(value: _htmlRuleFracSameDenominator(label2, minus()));
          fracCalc = numbers[0] - numbers[1];
          html += liSpan(
            value: _htmlFractionsSameDenominatorCalc(
              label3,
              numbers[0],
              numbers[1],
              calcSymbol,
              fracCalc,
            ),
          );
        } else {
          html += liSpan(
            value: _htmlRuleFracAdditionAndSubtraction(label2, minus()),
          );
          fracCalc = numbers[0] - numbers[1];
          html += liSpan(
            value: _htmlFractionsCalc(
              label3,
              numbers[0],
              numbers[1],
              calcSymbol,
              fracCalc,
            ),
          );
        }
        break;
      case "*":
        html += liSpan(value: _htmlRuleFracMultiplication(label2));
        fracCalc = numbers[0] * numbers[1];
        html += liSpan(
          value: _htmlFractionsMultiply(
            label3,
            numbers[0],
            numbers[1],
            texTimes(),
            fracCalc,
          ),
        );
        break;
      default:
        html += liSpan(value: _htmlRuleFracDivision(label2));
        fracCalc = numbers[0] / numbers[1];
        html += liSpan(
          value: _htmlFractionsDivision(
            label3,
            numbers[0],
            numbers[1],
            divide(),
            fracCalc,
          ),
        );
        break;
    }

    // 4. to simplest form
    String label4 = t.math_master.solver.steps_fractions_2;
    String htmlSimplestForm = _htmlToSimplestForm(label4, fracCalc, answer);
    if (htmlSimplestForm.isNotEmpty) {
      html += liSpan(value: htmlSimplestForm);
    }

    return (ol(value: html));
  }
}
