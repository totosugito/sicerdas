import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../models/my_number.dart';
import 'libs/html_lib.dart';

class PercentSteps extends LibHtml {
  PercentSteps({required List<MyNumber> numbers, required MyNumber answer})
    : super(numbers, answer);

  String _htmlPercentsOfNumber(String label) {
    String htmlLabel =
        span(id: idStepsLabel, value: sprintf(label, ["\n"])) + br();
    String html =
        texEqual() +
        texColor(value: numbers[0].getValueIText(), color: Colors.green) +
        texColor(value: texPercent(), color: Colors.red) +
        texText(value: spacing(t.math_master.of_text)) +
        texColor(value: numbers[1].getValueIText(), color: Colors.purple) +
        texBr(); // = 15% of 200
    html +=
        texEqual() +
        texFrac(
          numerator: texColor(
            value: numbers[0].getValueIText(),
            color: Colors.green,
          ),
          denominator: texColor(value: "100", color: Colors.red),
        ) +
        times() +
        texColor(value: numbers[1].getValueIText(), color: Colors.purple) +
        texBr(isNormal: false); // 10/100 * 200
    html +=
        texEqual() +
        texFrac(
          numerator:
              texColor(value: numbers[0].getValueIText(), color: Colors.green) +
              times() +
              texColor(value: numbers[1].getValueIText(), color: Colors.purple),
          denominator: texColor(value: "100", color: Colors.red),
        ) +
        texBr(isNormal: false); // 10*200/100
    html +=
        texEqual() +
        texFrac(
          numerator: (numbers[0].getValI() * numbers[1].getValI()).toString(),
          denominator: "100",
        ) +
        texBr(isNormal: false); // 10*200/100
    html += texEqual() + answer.toString(); // 10*200/100
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }




  String _htmlPercentWeKnow(String label) {
    String htmlLabel = span(
      id: idStepsLabel,
      value: sprintf(label, ["\n"]) + br(),
    );
    String html =
        texColor(value: "1", color: Colors.green) +
        texColor(value: texPercent(), color: Colors.red) +
        texEqual(isAlign: false) +
        texFrac(
          numerator: texColor(value: "1", color: Colors.green),
          denominator: texColor(value: "100", color: Colors.red),
        );
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String htmlPercentsOfNumber() {
    String html = "";

    // 1. learn about simplest form
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
      module: createHtmlBadge(
        t.math_master.topics_fractions,
        t.math_master.chapter_fractions_simplest_form,
      ),
      br: br(),
    );
    html += liSpan(
      value: span(id: idStepsLabel, value: label1),
    );

    // 2. Multiply the fraction by 100%
    String label2 = t.math_master.solver.fractions_to_percents_step_1;
    String step2Html =
        texEqual() +
        numbers[0].toString() +
        texColor(
          value: "${texTimes()}100${texPercent()}",
          color: Colors.green,
        );
    html += liSpan(
      value:
          span(id: idStepsLabel, value: label2) +
          br() +
          tex(value: texAligned(value: step2Html)),
    );

    // 3. Calculate the numerator
    String label3 = t.math_master.solver.fractions_to_percents_step_2;
    String step3Html =
        texEqual() +
        texFrac(
          numerator:
              numbers[0].getNumText() +
              texColor(value: "${texTimes()}100", color: Colors.green),
          denominator: numbers[0].getDenText(),
        ) +
        texColor(value: texPercent(), color: Colors.green) +
        texBr(isNormal: false) +
        texEqual() +
        texFrac(
          numerator: (numbers[0].getNum() * 100).toString(),
          denominator: numbers[0].getDenText(),
        ) +
        texColor(value: texPercent(), color: Colors.green);
    html += liSpan(
      value:
          span(id: idStepsLabel, value: label3) +
          br() +
          tex(value: texAligned(value: step3Html)),
    );

    // 4. Divide to get the final result
    String label4 = t.math_master.solver.fractions_to_percents_step_3;
    String step4Html =
        texEqual() + answer.toString();
    html += liSpan(
      value:
          span(id: idStepsLabel, value: label4) +
          br() +
          tex(value: texAligned(value: step4Html)),
    );

    return (ol(value: html));
  }

  String htmlPercentsToFractions() {
    String html = "";
    // 1. learn about simplest form
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

    // 2. Convert percent to fraction with denominator 100
    String label2 = t.math_master.solver.percents_to_fractions_step_1;
    String step2Html =
        texColor(value: numbers[0].getValI().toString(), color: Colors.green) +
        texColor(value: texPercent(), color: Colors.red) +
        texEqual() +
        texFrac(
          numerator: texColor(
            value: numbers[0].getValI().toString(),
            color: Colors.green,
          ),
          denominator: texColor(value: "100", color: Colors.red),
        );
    html += liSpan(
      value:
          span(id: idStepsLabel, value: label2) +
          br() +
          tex(value: texAligned(value: step2Html)),
    );

    // 3. Simplify the fraction if GCD is not 1
    int denominator = 100 ~/ answer.getDen();
    if (denominator != 1) {
      String label3 = t.math_master.solver.percents_to_fractions_step_2(
        gcf: denominator.toString(),
      );
      String step3Html =
          texFrac(
            numerator:
                texColor(
                  value: numbers[0].getValI().toString(),
                  color: Colors.green,
                ) +
                texColor(
                  value: divide() + denominator.toString(),
                  color: Colors.blue,
                ),
            denominator:
                texColor(value: "100", color: Colors.red) +
                texColor(
                  value: divide() + denominator.toString(),
                  color: Colors.blue,
                ),
          ) +
          texEqual() +
          answer.toString();
      html += liSpan(
        value:
            span(id: idStepsLabel, value: label3) +
            br() +
            tex(value: texAligned(value: step3Html)),
      );
    } else {
      String label3 = t.math_master.solver.percents_to_fractions_step_2_simple;
      html += liSpan(
        value:
            span(id: idStepsLabel, value: label3) +
            br() +
            tex(
              value: texAligned(
                value:
                    texFrac(
                      numerator: texColor(
                        value: numbers[0].getValI().toString(),
                        color: Colors.green,
                      ),
                      denominator: texColor(value: "100", color: Colors.red),
                    ) +
                    texEqual() +
                    answer.toString(),
              ),
            ),
      );
    }

    return (ol(value: html));
  }
}
