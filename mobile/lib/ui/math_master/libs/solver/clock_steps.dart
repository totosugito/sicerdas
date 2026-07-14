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

  String _htmlCalcMinutesToHours(MyNumber number) {
    String html = "";
    int totalMinutes = number.getValI();

    // Step 1: Divide by 60
    html += liSpan(
      value:
          span(
            id: idStepsLabel,
            value: t.math_master.solver.clock_min_to_hours_step_1 + br(),
          ) +
          tex(
            value:
                "$totalMinutes \\div 60 = ${totalMinutes ~/ 60}\\text{ ${t.math_master.solver.remainder_of_text} }${totalMinutes % 60}",
          ),
    );

    // Step 2: Get quotient and remainder
    int hours = totalMinutes ~/ 60;
    int mins = totalMinutes % 60;
    html += liSpan(
      value:
          span(
            id: idStepsLabel,
            value: t.math_master.solver.clock_min_to_hours_step_2 + br(),
          ) +
          tex(
            value:
                "$hours\\text{ ${t.math_master.hours_sort_text.toLowerCase()} } + $mins\\text{ ${t.math_master.minutes_sort_text.toLowerCase()} }",
          ),
    );

    if (mins != 0) {
      // Step 3: Write remainder as fraction
      html += liSpan(
        value:
            span(
              id: idStepsLabel,
              value: t.math_master.solver.clock_min_to_hours_step_3 + br(),
            ) +
            tex(
              value:
                  "$hours\\frac{$mins}{60}\\text{ ${t.math_master.hours_sort_text.toLowerCase()} }",
            ),
      );

      // Step 4: Simplify if GCF > 1
      int gcf = libFactor.fastGcf([MyNumber(value: mins), MyNumber(value: 60)]);
      if (gcf > 1) {
        html += liSpan(
          value:
              span(
                id: idStepsLabel,
                value: t.math_master.solver.clock_min_to_hours_step_4 + br(),
              ) +
              tex(
                value:
                    "$hours\\frac{$mins \\div $gcf}{60 \\div $gcf} = ${answer.toString()}\\text{ ${t.math_master.hours_sort_text.toLowerCase()} }",
              ),
        );
      }
    }
    return html;
  }

  String _htmlCalcHoursToMinutes(MyNumber number) {
    String html = "";
    if (number.isFraction()) {
      // Step 1: Separate integer and fraction parts
      html += liSpan(
        value:
            span(
              id: idStepsLabel,
              value: t.math_master.solver.clock_hours_to_min_step_2_frac + br(),
            ) +
            tex(
              value:
                  "${number.toString()}\\text{ ${t.math_master.hour_text.toLowerCase()} } = ${number.getValI()}\\text{ ${t.math_master.hour_text.toLowerCase()} } + \\frac{${number.getNum()}}{${number.getDen()}}\\text{ ${t.math_master.hour_text.toLowerCase()} }",
            ),
      );

      // Step 2: Multiply integer part by 60
      int wholeMins = number.getValI() * 60;
      html += liSpan(
        value:
            span(
              id: idStepsLabel,
              value: t.math_master.solver.clock_hours_to_min_step_3_frac + br(),
            ) +
            tex(
              value:
                  "${number.getValI()} \\times 60 = $wholeMins\\text{ ${t.math_master.minutes_sort_text.toLowerCase()} }",
            ),
      );

      // Step 3: Multiply fraction part by 60
      int fracMins = number.getNum() * 60 ~/ number.getDen();
      html += liSpan(
        value:
            span(
              id: idStepsLabel,
              value: t.math_master.solver.clock_hours_to_min_step_4_frac + br(),
            ) +
            tex(
              value:
                  "\\frac{${number.getNum()}}{${number.getDen()}} \\times 60 = $fracMins\\text{ ${t.math_master.minutes_sort_text.toLowerCase()} }",
            ),
      );

      // Step 4: Add together
      html += liSpan(
        value:
            span(
              id: idStepsLabel,
              value: t.math_master.solver.clock_hours_to_min_step_5_frac + br(),
            ) +
            tex(
              value:
                  "$wholeMins + $fracMins = ${answer.toString()}\\text{ ${t.math_master.minutes_sort_text.toLowerCase()} }",
            ),
      );
    } else {
      // Simple multiplication
      html += liSpan(
        value:
            span(
              id: idStepsLabel,
              value: t.math_master.solver.clock_hours_to_min_step_1 + br(),
            ) +
            tex(
              value:
                  "${number.getValI()} \\times 60 = ${answer.toString()}\\text{ ${t.math_master.minutes_sort_text.toLowerCase()} }",
            ),
      );
    }
    return html;
  }

  String _htmlCalcTimeElapsed() {
    String html = "";
    MyNumber start = numbers[1];
    MyNumber end = numbers[0];

    // Step 1: Subtract start from end
    html += liSpan(
      value:
          span(
            id: idStepsLabel,
            value: t.math_master.solver.clock_elapsed_step_1 + br(),
          ) +
          tex(value: "${end.toString()} - ${start.toString()}"),
    );

    // Step 2: Separate grouping
    html += liSpan(
      value:
          span(
            id: idStepsLabel,
            value: t.math_master.solver.clock_elapsed_step_2 + br(),
          ) +
          tex(
            value:
                "(${texColor(value: end.getHourText(), color: Colors.blue)} - ${texColor(value: start.getHourText(), color: Colors.blue)})\\text{ ${t.math_master.hours_sort_text.toLowerCase()} } \\text{ ${t.math_master.solver.and_text} } (${texColor(value: end.getMinuteText(), color: Colors.purple)} - ${texColor(value: start.getMinuteText(), color: Colors.purple)})\\text{ ${t.math_master.minutes_sort_text.toLowerCase()} }",
          ),
    );

    if (end.getNum() < start.getNum()) {
      // Borrowing step
      html += liSpan(
        value:
            span(
              id: idStepsLabel,
              value: t.math_master.solver.clock_elapsed_step_3_borrow + br(),
            ) +
            tex(
              value:
                  "((${texColor(value: end.getHourText(), color: Colors.blue)} - 1) - ${texColor(value: start.getHourText(), color: Colors.blue)})\\text{ ${t.math_master.hours_sort_text.toLowerCase()} } \\text{ ${t.math_master.solver.and_text} } ((60 + ${texColor(value: end.getMinuteText(), color: Colors.purple)}) - ${texColor(value: start.getMinuteText(), color: Colors.purple)})\\text{ ${t.math_master.minutes_sort_text.toLowerCase()} }",
            ),
      );
    }

    // Step 4: Final calculation
    html += liSpan(
      value:
          span(
            id: idStepsLabel,
            value: t.math_master.solver.clock_elapsed_step_4 + br(),
          ) +
          tex(
            value:
                "${answer.getValueText()}\\text{ ${t.math_master.hours_sort_text.toLowerCase()} } ${answer.getNumText()}\\text{ ${t.math_master.minutes_sort_text.toLowerCase()} }",
          ),
    );

    return html;
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
    html += _htmlCalcMinutesToHours(numbers[0]);
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
    html += _htmlCalcHoursToMinutes(numbers[0]);

    return (ol(value: html));
  }

  String htmlElapsedTime() {
    String html = "";

    // 1. we know the formula
    String label2 = t.math_master.we_know_text;
    html += liSpan(value: _htmlClockWeKnow(label2));

    // 2. do calculation
    html += _htmlCalcTimeElapsed();

    return (ol(value: html));
  }
}
