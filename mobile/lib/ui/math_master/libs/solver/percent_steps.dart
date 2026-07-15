import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../models/my_number.dart';
import 'libs/html_lib.dart';

class PercentSteps extends LibHtml {
  PercentSteps({required List<MyNumber> numbers, required MyNumber answer})
      : super(numbers, answer);

  String _htmlPercentsOfNumber(String label) {
    String htmlLabel = span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();
    String html = texEqual() +
        texColor(value: numbers[0].getValueIText(), color: Colors.green) +
        texColor(value: texPercent(), color: Colors.red) +
        texText(value: spacing(t.math_master.of_text)) +
        texColor(value: numbers[1].getValueIText(), color: Colors.purple) +
        texBr(); // = 15% of 200
    html += texEqual() +
        texFrac(
            numerator: texColor(value: numbers[0].getValueIText(), color: Colors.green),
            denominator: texColor(value: "100", color: Colors.red)) +
        times() +
        texColor(value: numbers[1].getValueIText(), color: Colors.purple) +
        texBr(isNormal: false); // 10/100 * 200
    html += texEqual() +
        texFrac(
            numerator: texColor(value: numbers[0].getValueIText(), color: Colors.green) +
                times() +
                texColor(value: numbers[1].getValueIText(), color: Colors.purple),
            denominator: texColor(value: "100", color: Colors.red)) +
        texBr(isNormal: false); // 10*200/100
    html += texEqual() +
        texFrac(numerator: (numbers[0].getValI() * numbers[1].getValI()).toString(), denominator: "100") +
        texBr(isNormal: false); // 10*200/100
    html += texEqual() + answer.toString(); // 10*200/100
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlFractionsToPercents(String label) {
    String htmlLabel = span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();
    String html = texEqual() +
        numbers[0].toString() +
        texColor(value: "${texTimes()}100${texPercent()}", color: Colors.green) +
        texBr(isNormal: false); // 2/5 * 100%
    html += texEqual() +
        texFrac(
            numerator: numbers[0].getNumText() + texColor(value: "${texTimes()}100", color: Colors.green),
            denominator: numbers[0].getDenText()) +
        texColor(value: texPercent(), color: Colors.green) +
        texBr(isNormal: false); // 2*100/5
    html += texEqual() +
        texFrac(numerator: (numbers[0].getNum() * 100).toString(), denominator: numbers[0].getDenText()) +
        texColor(value: texPercent(), color: Colors.green) +
        texBr(isNormal: false); // 200/5

    html += texEqual() + answer.toString() + texPercent(); // 40%
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlPercentWeKnow(String label) {
    String htmlLabel = span(id: idStepsLabel, value: sprintf(label, ["\n"]) + br());
    String html = texColor(value: "1", color: Colors.green) +
        texColor(value: texPercent(), color: Colors.red) +
        texEqual(isAlign: false) +
        texFrac(
            numerator: texColor(value: "1", color: Colors.green),
            denominator: texColor(value: "100", color: Colors.red));
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlPercentToFraction(String label) {
    String htmlLabel = span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();

    String html = texColor(value: numbers[0].getValI().toString(), color: Colors.green) +
        texColor(value: texPercent(), color: Colors.red) +
        texEqual() +
        texFrac(
            numerator: texColor(value: numbers[0].getValI().toString(), color: Colors.green),
            denominator: texColor(value: "100", color: Colors.red)) +
        texBr(isNormal: false); // 10% = 10/100

    int denominator = 100 ~/ answer.getDen();
    if (denominator != 1) {
      html += texEqual() +
          texFrac(
              numerator: texColor(value: numbers[0].getValI().toString(), color: Colors.green) +
                  texColor(value: divide() + denominator.toString(), color: Colors.blue),
              denominator: texColor(value: "100", color: Colors.red) +
                  texColor(value: divide() + denominator.toString(), color: Colors.blue)) +
          texBr(isNormal: false); // 2*100/5
    }

    html += texEqual() + answer.toString(); // 1/10
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String htmlPercentsOfNumber() {
    String html = "";

    // 1. learn about simplest form
    String label1 = t.math_master.steps_complete_prev_module(
      module: createHtmlBadge(t.math_master.topics_fractions, t.math_master.chapter_fractions_simplest_form),
      br: br(),
    );
    html += liSpan(value: span(id: idStepsLabel, value: label1));

    // 2. we know the formula
    String label2 = t.math_master.we_know_text;
    html += liSpan(value: _htmlPercentWeKnow(label2));

    // 3. do the calculation
    String label3 = t.math_master.steps_do_the_calculation;
    html += liSpan(value: _htmlPercentsOfNumber(label3));

    return (ol(value: html));
  }

  String htmlFractionsToPercents() {
    String html = "";

    // 1. learn about simplest form
    String label1 = t.math_master.steps_complete_prev_module(
      module: createHtmlBadge(t.math_master.topics_fractions, t.math_master.chapter_fractions_simplest_form),
      br: br(),
    );
    html += liSpan(value: span(id: idStepsLabel, value: label1));

    // 2. do the calculation
    String label2 = t.math_master.steps_do_the_calculation;
    html += liSpan(value: _htmlFractionsToPercents(label2));

    return (ol(value: html));
  }

  String htmlPercentsToFractions() {
    String html = "";
    // 1. learn about simplest form
    String label1 = t.math_master.steps_complete_prev_module(
      module: createHtmlBadge(t.math_master.topics_fractions, t.math_master.chapter_fractions_simplest_form),
      br: br(),
    );
    html += liSpan(value: span(id: idStepsLabel, value: label1));

    // 2. we know the formula
    String label2 = t.math_master.we_know_text;
    html += liSpan(value: _htmlPercentWeKnow(label2));

    // 3. do the calculation
    String label3 = t.math_master.steps_do_the_calculation;
    html += liSpan(value: _htmlPercentToFraction(label3));

    return (ol(value: html));
  }
}
