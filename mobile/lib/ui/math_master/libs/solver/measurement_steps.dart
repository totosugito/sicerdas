import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../models/enums.dart';
import '../models/my_number.dart';
import 'libs/html_lib.dart';
import 'measurement_lib.dart';

class MeasurementSteps extends LibHtml {
  late MeasurementLib lib;
  late List<MyNumber> multiplier;

  MeasurementSteps({
    required List<MyNumber> numbers,
    required MyNumber answer,
  }) : super(numbers, answer);

  void setLibrary(MeasurementLib lib_) {
    lib = lib_;
  }

  String _htmlMeasurementUnitTable(String label) {
    String htmlLabel = span(id: idStepsLabel, value: label + br());

    String html = image(
      value: lib.keyMeasurement == KeyMeasurement.length
          ? "images/unit_of_length.png"
          : "images/unit_of_weight.png",
    );
    return (htmlLabel + html);
  }

  String _htmlUnitConversionFormula(
    MyNumber fromValue,
    MyNumber toValue,
    Color color,
  ) {
    String html = "";
    num dMul = 0.0;

    MyNumber numMult;
    if (fromValue.id <= toValue.id) {
      dMul = lib.getMultiplierConst(fromValue.id, toValue.id);
      numMult = MyNumber(
        id: toValue.id,
        unit: toValue.unit,
        value: dMul.toInt(),
        denominator: 0,
        type: KeyDataType.measurement,
      );
      html += texColor(
            value: "1" + texText(value: " " + fromValue.getUnit()),
            color: color,
          ) +
          texEqual() +
          texColor(
            value: numMult.getValueIText() +
                texText(value: " " + toValue.getUnit()),
            color: color,
          );
    } else {
      dMul = lib.getMultiplierConst(toValue.id, fromValue.id);
      numMult = MyNumber(
        id: toValue.id,
        unit: toValue.unit,
        value: 0,
        numerator: 1,
        denominator: dMul.toInt(),
        type: KeyDataType.measurement,
      );
      html += texColor(
            value: "1" + texText(value: " " + fromValue.getUnit()),
            color: color,
          ) +
          texEqual() +
          texColor(value: numMult.toString(), color: color);
    }
    multiplier.add(numMult);
    return (html);
  }

  String _htmlConversionFormula(
    String label,
    MyNumber fromValue1,
    MyNumber fromValue2,
    MyNumber toValue,
  ) {
    String htmlLabel = span(
          id: idStepsLabel,
          value: sprintf(label, ["\n"]),
        ) +
        br();

    String html = _htmlUnitConversionFormula(fromValue1, toValue, autoColor[0]);
    if (numbers.length > 1) {
      html += texBr() +
          _htmlUnitConversionFormula(fromValue2, toValue, autoColor[1]);
    }

    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String _htmlConversionSingle(
    String label,
    MyNumber fromValue,
    MyNumber toValue,
  ) {
    String htmlLabel = span(id: idStepsLabel, value: sprintf(label, [br()]));

    String html = texColor(
          value: fromValue.getValueIText(),
          color: autoColor[1],
        ) +
        texColor(
          value: texText(value: " " + fromValue.getUnit()),
          color: autoColor[0],
        );
    html += texEqual() +
        texColor(value: fromValue.getValueIText(), color: autoColor[1]) +
        texTimes() +
        texColor(value: multiplier[0].toString(), color: autoColor[0]) +
        texBr();
    html +=
        texEqual() + answer.toString() + texText(value: " " + answer.getUnit());
    html = tex(value: texAligned(value: html));
    return (htmlLabel + html);
  }

  String htmlMeasurementConversionQuestion() {
    String html = numbers[0].toString() +
        texEqual(isAlign: false) +
        texLdots() +
        texText(value: answer.getUnit());
    return (html);
  }

  String htmlConversionSteps() {
    String html = "";

    // result have same units
    if (numbers[0].id == answer.id) {
      String labelResult = t.math_master.steps_measurement_1;
      String question = numbers[0].toString();
      html += liSpan(
        value: showHtmlResult(
          label: labelResult,
          input: tex(value: question),
          result: answer.getValueIText() + spacing(answer.getUnit()),
        ),
      );
      return (ol(value: html));
    }

    multiplier = [];

    // table conversion
    String label1 = (lib.keyMeasurement == KeyMeasurement.length)
        ? t.math_master.steps_table_length
        : t.math_master.steps_table_weight;
    html += liSpan(value: _htmlMeasurementUnitTable(label1));

    // do the conversion
    String label2 = t.math_master.we_know_text;
    html += liSpan(
      value: _htmlConversionFormula(label2, numbers[0], numbers[0], answer),
    );

    // do the conversion
    String label3 = t.math_master.steps_do_the_calculation;
    html += liSpan(value: _htmlConversionSingle(label3, numbers[0], answer));

    // show the result
    String labelResult = t.math_master.steps_measurement_1;
    String question = numbers[0].toString();
    html += liSpan(
      value: showHtmlResult(
        label: labelResult,
        input: tex(value: question),
        result: answer.getValueIText() + spacing(answer.getUnit()),
      ),
    );
    return (ol(value: html));
  }

  String _htmlMeasurementCalculation(
    String label,
    MyNumber fromValue1,
    MyNumber fromValue2,
    MyNumber toValue,
    String symbol,
  ) {
    String htmlLabel = span(id: idStepsLabel, value: sprintf(label, [br()]));

    String html = equal() +
        texColor(value: fromValue1.getValueIText(), color: autoColor[2]) +
        texColor(
          value: texText(value: " " + fromValue1.getUnit()),
          color: autoColor[0],
        ) +
        symbol +
        texColor(value: fromValue2.getValueIText(), color: autoColor[3]) +
        texColor(
          value: texText(value: " " + fromValue2.getUnit()),
          color: autoColor[1],
        ) +
        texBr();

    String var1NoMult = texColor(
          value: fromValue1.getValueIText(),
          color: autoColor[2],
        ) +
        texColor(
          value: texText(value: " " + multiplier[0].getUnit()),
          color: autoColor[0],
        );
    String var1Mult = parenthesis(
      value: texColor(value: fromValue1.getValueIText(), color: autoColor[2]) +
          texTimes() +
          texColor(value: multiplier[0].toString(), color: autoColor[0]),
    );
    String var1 = multiplier[0].getValI() == 1 ? var1NoMult : var1Mult;

    String var2NoMult = texColor(
          value: fromValue2.getValueIText(),
          color: autoColor[3],
        ) +
        texColor(
          value: texText(value: " " + multiplier[1].getUnit()),
          color: autoColor[1],
        );
    String var2Mult = parenthesis(
      value: texColor(value: fromValue2.getValueIText(), color: autoColor[3]) +
          texTimes() +
          texColor(value: multiplier[1].toString(), color: autoColor[1]),
    );
    String var2 = multiplier[1].getValI() == 1 ? var2NoMult : var2Mult;
    html += equal() + var1 + symbol + var2 + texBr();

    int val1 = multiplier[0].getValI() == 0
        ? fromValue1.getValI() ~/ multiplier[0].getDen()
        : fromValue1.getValI() * multiplier[0].getValI();
    int val2 = multiplier[1].getValI() == 0
        ? fromValue2.getValI() ~/ multiplier[1].getDen()
        : fromValue2.getValI() * multiplier[1].getValI();
    html += equal() +
        val1.toString() +
        texText(value: " " + answer.getUnit()) +
        symbol +
        val2.toString() +
        texText(value: " " + answer.getUnit()) +
        texBr();
    html +=
        equal() + answer.toString() + texText(value: " " + answer.getUnit());
    html = tex(value: html);
    return (htmlLabel + html);
  }

  String htmlMeasurementCalculationQuestion(String symbol) {
    String html = numbers[0].toString() +
        symbol +
        numbers[1].toString() +
        texEqual(isAlign: false) +
        texLdots() +
        texText(value: answer.getUnit());
    return (html);
  }

  String htmlMeasurementCalculationSteps(String symbol) {
    String html = "";
    multiplier = [];

    // result have same units
    if ((numbers[0].id == answer.id) && (numbers[1].id == answer.id)) {
      String labelResult = t.math_master.steps_measurement_1;
      String question = numbers[0].toString() + symbol + numbers[1].toString();
      html += liSpan(
        value: showHtmlResult(
          label: labelResult,
          input: tex(value: question),
          result: answer.getValueIText() + spacing(answer.getUnit()),
        ),
      );
      return (ol(value: html));
    }

    // 1. learn about previous module
    String badgePreviousModule = (lib.keyMeasurement == KeyMeasurement.length)
        ? createHtmlBadge(
            t.math_master.topics_length,
            t.math_master.chapter_length_conversion,
          )
        : createHtmlBadge(
            t.math_master.topics_weight,
            t.math_master.chapter_weight_conversion,
          );
    String label1 = t.math_master.steps_complete_prev_module(
      module: badgePreviousModule,
      br: br(),
    );
    html += liSpan(value: span(id: idStepsLabel, value: label1));

    // do the conversion
    String label2 = t.math_master.we_know_text;
    html += liSpan(
      value: _htmlConversionFormula(label2, numbers[0], numbers[1], answer),
    );

    // do the conversion
    String label3 = t.math_master.steps_do_the_calculation;
    html += liSpan(
      value: _htmlMeasurementCalculation(
        label3,
        numbers[0],
        numbers[1],
        answer,
        symbol,
      ),
    );

    // show result
    String labelResult = t.math_master.steps_measurement_1;
    String question = numbers[0].toString() + symbol + numbers[1].toString();
    html += liSpan(
      value: showHtmlResult(
        label: labelResult,
        input: tex(value: question),
        result: answer.getValueIText() + spacing(answer.getUnit()),
      ),
    );
    return (ol(value: html));
  }
}
