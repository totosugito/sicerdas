import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../models/my_number.dart';
import 'libs/html_lib.dart';
import 'factorization_lib.dart';

class ClockSteps extends LibHtml {
  late FactorizationLib libFactor;

  ClockSteps({required List<MyNumber> numbers, required MyNumber answer})
    : super(numbers, answer) {
    libFactor = FactorizationLib();
  }

  String _htmlClockWeKnow(String label) {
    String html = span(id: idStepsLabel, value: label + br());
    html += tex(
      value:
          "1${texText(value: " ${t.math_master.hour_text.toLowerCase()}")}${equal()} 60${texText(value: " ${t.math_master.minutes_text.toLowerCase()}")}",
    );
    return (html);
  }

  String _htmlCalcMinutesToHours(String label, MyNumber number) {
    String htmlLabel = span(
      id: idStepsLabel,
      value:
          "$label${tex(value: number.getValI().toString() + texText(value: " ${t.math_master.minutes_text.toLowerCase()}"))}${br()}\n",
    );

    String html = "${texEqual()}${number.getValI()} : 60${texBr()}"; // = a : 60
    if (answer.getNum() != 0) {
      String v0 = answer.getValI().toString();
      int residue = number.getValI() % 60;
      String n0 = residue.toString();

      // show as text = 5 hr 30 min
      html +=
          texEqual() +
          answer.getValI().toString() +
          texText(value: " ${t.math_master.hours_sort_text.toLowerCase()} + ") +
          residue.toString() +
          texText(value: " ${t.math_master.minutes_sort_text.toLowerCase()}") +
          texBr();

      // show as fraction
      html +=
          texEqual() +
          texFrac(value: v0, numerator: n0, denominator: "60") +
          texBr(isNormal: false); // = a b/c

      // simplest form
      int gcf = libFactor.fastGcf([
        MyNumber(value: residue),
        MyNumber(value: 60),
      ]);
      if (residue != answer.getNum()) {
        html +=
            texEqual() +
            texFrac(
              value: v0,
              numerator: n0 + divide() + gcf.toString(),
              denominator: "60${divide()}$gcf",
            ) +
            texBr(isNormal: false); // = a b/c
      }
    }

    // final result = 5 hours
    html +=
        texEqual() +
        answer.toString() +
        texText(value: " ${t.math_master.hours_sort_text.toLowerCase()}");

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlCalcHoursToMinutes(String label, MyNumber number) {
    String htmlLabel = span(
      id: idStepsLabel,
      value: "$label${tex(value: "${number.toString()}${texText(value: " ${t.math_master.hour_text.toLowerCase()}")}")}${br()}\n",
    );

    // final result = 4 minutes x 60
    String html = "${texEqual()}$number${texTimes()}60${texBr()}"; // = a : 60

    if (number.isFraction()) {
      html += "${texEqual()}${parenthesis(value: "${number.getValI()}${texTimes()}60")}${plus()}${parenthesis(value: "${texFrac(numerator: number.getNum().toString(), denominator: number.getDen().toString())}${texTimes()}60")}${texBr(isNormal: false)}";
      html += "${texEqual()}${number.getValI() * 60}${plus()}${number.getNum() * 60 ~/ number.getDen()}${texBr()}";
    }

    // final result = 220 minutes
    html += "${texEqual()}$answer${texText(value: " ${t.math_master.minutes_sort_text.toLowerCase()}")}";

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlCalcTimeElapsed(String label) {
    String htmlLabel = span(id: idStepsLabel, value: "$label${br()}");
    String html = "${texEqual()}${texColor(value: numbers[0].getHourText(), color: Colors.blue)}:${texColor(value: numbers[0].getMinuteText(), color: Colors.purple)}${minus()}${texColor(value: numbers[1].getHourText(), color: Colors.blue)}:${texColor(value: numbers[1].getMinuteText(), color: Colors.purple)}${texBr()}"; // = a:b - c:d
    html += "${texEqual()}${parenthesis(value: "${texColor(value: numbers[0].getHourText(), color: Colors.blue)}${minus()}${texColor(value: numbers[1].getHourText(), color: Colors.blue)}")}${divide()}${parenthesis(value: "${texColor(value: numbers[0].getMinuteText(), color: Colors.purple)}${minus()}${texColor(value: numbers[1].getMinuteText(), color: Colors.purple)}")}${texBr()}"; // = (a-c):(b-d)

    if (numbers[0].getNum() < numbers[1].getNum()) {
      html += "${texEqual()}${parenthesis(value: texText(value: "${texColor(value: numbers[0].getHourText(), color: Colors.blue)}${texColor(value: "${minus()}1", color: Colors.red)}${minus()}${texColor(value: numbers[1].getHourText(), color: Colors.blue)}"))}${divide()}${parenthesis(value: texText(value: "${texColor(value: "60${plus()}", color: Colors.green)}${texColor(value: numbers[0].getMinuteText(), color: Colors.purple)}${minus()}${texColor(value: numbers[1].getMinuteText(), color: Colors.purple)}"))}${texBr()}"; // = (a-1-c):(b+60-d)
    }

    html += "${texEqual()}$answer${texBr()}"; // = e:f
    html += "${texEqual()}${answer.getValueText()}${texText(value: spacing(t.math_master.hours_sort_text))}${answer.getNumText()}${texText(value: spacing(t.math_master.minutes_sort_text))}${texBr()}"; // = e jam f mnt
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String htmlMinutesToHours() {
    String html = "";
    // 1. learn about simplest form
    String label1 = t.math_master.steps_complete_prev_module(
      module: createHtmlBadge(
        t.math_master.topics_fractions,
        t.math_master.chapter_fractions_simplest_form,
      ),
      br: br(),
    );
    html += answer.isFraction()
        ? liSpan(
            value: span(id: idStepsLabel, value: label1),
          )
        : "";

    // 2. we know the formula
    String label2 = t.math_master.we_know_text;
    html += liSpan(value: _htmlClockWeKnow(label2));

    // 3. do calculation
    String label3 = t.math_master.do_calculation_of_text;
    html += liSpan(value: _htmlCalcMinutesToHours(label3, numbers[0]));
    return (ol(value: html));
  }

  String htmlHoursToMinutes() {
    String html = "";

    // 1. learn about simplest form
    String label1 = t.math_master.steps_complete_prev_module(
      module: createHtmlBadge(
        t.math_master.topics_fractions,
        t.math_master.chapter_fractions_from_mixed,
      ),
      br: br(),
    );
    html += numbers[0].isFraction()
        ? liSpan(
            value: span(id: idStepsLabel, value: label1),
          )
        : "";

    // 2. we know the formula
    String label2 = t.math_master.we_know_text;
    html += liSpan(value: _htmlClockWeKnow(label2));

    // 3. do calculation
    String label3 = t.math_master.do_calculation_of_text;
    html += liSpan(value: _htmlCalcHoursToMinutes(label3, numbers[0]));

    return (ol(value: html));
  }

  String htmlElapsedTime() {
    String html = "";

    // 1. we know the formula
    String label2 = t.math_master.we_know_text;
    html += liSpan(value: _htmlClockWeKnow(label2));

    // 2. do calculation
    String label3 = t.math_master.steps_do_the_calculation;
    html += liSpan(value: _htmlCalcTimeElapsed(label3));

    return (ol(value: html));
  }
}
