// note
// - perhitungan perkalian pecahan biasa dan pecahan campuran masih error

import '../solver/libs/roman_lib.dart';
import 'enums.dart';
import 'my_random.dart';
import 'model_number.dart';

class MyNumber {
  late int id;
  late String valueText;
  late num value;
  late int numerator;
  late int denominator;
  late int decimalPlaces;
  late String unit;
  late KeyDataType type;

  MyNumber({
    this.id = 0,
    this.valueText = "",
    this.value = 0,
    this.numerator = 0,
    this.denominator = 1,
    this.unit = "",
    this.decimalPlaces = 0,
    this.type = KeyDataType.integer,
  });

  MyNumber.empty() {
    id = 0;
    valueText = "";
    value = 0;
    numerator = 0;
    denominator = 1;
    unit = "";
    decimalPlaces = 0;
    type = KeyDataType.integer;
  }

  MyNumber.abs(MyNumber other) {
    id = other.id;
    value = other.value.abs();
    numerator = other.numerator;
    denominator = other.denominator;
    decimalPlaces = other.decimalPlaces;
    unit = other.unit;
    type = other.type;
    valueText = toString();
  }

  MyNumber.clone(MyNumber other) {
    id = other.id;
    valueText = other.valueText;
    value = other.value;
    numerator = other.numerator;
    denominator = other.denominator;
    decimalPlaces = other.decimalPlaces;
    unit = other.unit;
    type = other.type;
  }

  MyNumber.toHours(MyNumber other) {
    id = other.id;
    valueText = other.valueText;
    value = other.value;
    numerator = other.numerator;
    denominator = other.denominator;
    decimalPlaces = other.decimalPlaces;
    unit = other.unit;
    minuteToHours();
  }

  MyNumber.toMinutes(MyNumber other) {
    id = other.id;
    valueText = other.valueText;
    value = other.value;
    numerator = other.numerator;
    denominator = other.denominator;
    decimalPlaces = other.decimalPlaces;
    unit = other.unit;
    hoursToMinutes();
  }

  MyNumber.nextInt({
    this.type = KeyDataType.integer,
    this.id = 0,
    this.unit = "",
    RandomMode mode = RandomMode.range,
    required MyRandom myRandom,
    required ModelNumber minMax,
  }) {
    int min_ = minMax.min.toInt();
    int max_ = minMax.max.toInt();
    int spacing_ = minMax.spacing.toInt();
    int value_ = myRandom.nextInt(min: min_, spacing: spacing_, max: max_);
    _initInt();
    value = value_;
  }

  MyNumber.nextFractions({
    this.type = KeyDataType.fractions,
    this.id = 0,
    this.unit = "",
    RandomMode mode = RandomMode.range,
    required MyRandom myRandom,
    required ModelNumber minMax,
    bool simplify = false,
  }) {
    // create main value
    int min = minMax.min.toInt();
    int max = minMax.max.toInt();
    int spacing = minMax.spacing.toInt();
    int value_ = myRandom.nextInt(
      mode: mode,
      min: min,
      spacing: spacing,
      max: max,
    );

    // create numerator
    int minNum = minMax.minNum.toInt();
    int maxNum = minMax.maxNum.toInt();
    int spacingNum = minMax.spacingNum.toInt();
    int numerator_ = myRandom.nextInt(
      mode: mode,
      min: minNum,
      spacing: spacingNum,
      max: maxNum,
    );

    // create denominator
    int minDen = minMax.minDen.toInt();
    int maxDen = minMax.maxDen.toInt();
    int spacingDen = minMax.spacingDen.toInt();
    int denominator_ = myRandom.nextInt(
      mode: mode,
      min: minDen,
      spacing: spacingDen,
      max: maxDen,
    );

    _initInt();
    value = value_;
    numerator = numerator_;
    denominator = denominator_;

    numeratorLessThanDenominatorAndNotEqual();

    if (simplify) {
      toSimplify();
    }
  }

  MyNumber.nextIntUnique({
    bool useOneDigit = false,
    this.type = KeyDataType.integer,
    this.id = 0,
    this.unit = "",
    required List<MyNumber> rawList,
    required int checkNumber,
    int spacing = 1,
  }) {
    // checkNumber must 1 digit
    if (useOneDigit) {
      checkNumber = checkNumber < 10 ? checkNumber : 1;
      spacing = 1;
    }

    spacing = spacing < 0 ? 1 : spacing; // must positive
    int idx = 0;
    while (idx < rawList.length) {
      if (rawList[idx].isEqualI(checkNumber)) {
        checkNumber += spacing;
        idx = -1;
      }

      // only accepted one digit
      if ((useOneDigit == true) && (checkNumber > 9)) {
        checkNumber = 1;
        idx = -1;
      }
      idx += 1;
    }

    _initInt();
    value = checkNumber;
    valueText = toString();
  }

  MyNumber.nextFractionUnique({
    bool useOneDigit = false,
    this.type = KeyDataType.fractions,
    this.id = 0,
    this.unit = "",
    required List<MyNumber> rawList,
    required MyNumber checkNumber,
    int spacing = 1,
  }) {
    int idx = 0;
    while (idx < rawList.length) {
      if (rawList[idx].isEqual(checkNumber)) {
        if (checkNumber.numerator == 0 || checkNumber.denominator == 0) {
          checkNumber.value += spacing;
        } else {
          if (checkNumber.getVal().toInt() != 0) {
            // add value with spacing
            int v = checkNumber.numerator += spacing;
            checkNumber.value = v < checkNumber.denominator
                ? checkNumber.value
                : checkNumber.value + 1;
            checkNumber.numerator = v < checkNumber.denominator
                ? v
                : checkNumber.numerator;
          } else {
            // only update numerator
            checkNumber.numerator += spacing;
          }
        }
        idx = -1;
      }
      idx += 1;
    }
    clone(checkNumber); // clone data from checkNumber
  }

  void _initInt() {
    valueText = "";
    value = 0;
    numerator = 0;
    denominator = 1;
    decimalPlaces = 0;
  }

  void minuteToHours() {
    type = KeyDataType.hours;
    numerator = (value % 60).toInt();
    value = value ~/ 60;
    denominator = 60;

    // fractions simples form
    int gcd = numerator.gcd(denominator);
    numerator = numerator ~/ gcd;
    denominator = denominator ~/ gcd;
  }

  void hoursToMinutes() {
    type = KeyDataType.minutes;
    value = (value * 60) + (numerator * 60 ~/ denominator);
    numerator = 0;
    denominator = 1;
  }

  void toSimplify() {
    if (numerator == 0 || denominator == 0) {
      return;
    }

    // fractions simples form
    int gcd = numerator.gcd(denominator);
    numerator = numerator ~/ gcd;
    denominator = denominator ~/ gcd;
  }

  bool isOneDigit() {
    return (getValue().abs() < 10);
  }

  bool isNegative() {
    return (getValue() < 0);
  }

  void abs() {
    value = value.abs();
  }

  MyNumber operator +(MyNumber b) {
    switch (type) {
      case KeyDataType.fractions:
        int numerator_ =
            (numerator * b.denominator) + (denominator * b.numerator);
        int denominator_ = denominator * b.denominator;
        MyNumber r = MyNumber(
          id: id,
          valueText: valueText,
          value: value + b.value,
          numerator: numerator_,
          denominator: denominator_,
          decimalPlaces: decimalPlaces,
          unit: unit,
          type: type,
        );
        // r.toSimplify();
        return (r);
      default:
        return (MyNumber(
          id: id,
          valueText: valueText,
          value: value + b.value,
          numerator: numerator,
          denominator: denominator,
          decimalPlaces: decimalPlaces,
          unit: unit,
          type: type,
        ));
    }
  }

  MyNumber operator -(MyNumber b) {
    switch (type) {
      case KeyDataType.fractions:
        int numerator_ =
            (numerator * b.denominator) - (denominator * b.numerator);
        int denominator_ = denominator * b.denominator;
        MyNumber r = MyNumber(
          id: id,
          valueText: valueText,
          value: value - b.value,
          numerator: numerator_,
          denominator: denominator_,
          decimalPlaces: decimalPlaces,
          unit: unit,
          type: type,
        );
        // r.toSimplify();
        return (r);
      case KeyDataType.clock:
        int hour_ = getValI();
        int minute_ = numerator;
        if (minute_ < b.numerator) {
          hour_ = hour_ - 1;
          minute_ = minute_ + 60;
        }
        return (MyNumber(
          id: id,
          valueText: valueText,
          value: hour_ - b.value,
          numerator: minute_ - b.numerator,
          denominator: denominator,
          decimalPlaces: decimalPlaces,
          unit: unit,
          type: KeyDataType.clock,
        ));
      default:
        return (MyNumber(
          id: id,
          valueText: valueText,
          value: value - b.value,
          numerator: numerator,
          denominator: denominator,
          decimalPlaces: decimalPlaces,
          unit: unit,
          type: type,
        ));
    }
  }

  MyNumber operator *(MyNumber b) {
    switch (type) {
      case KeyDataType.fractions:
        MyNumber r = MyNumber(
          id: id,
          valueText: valueText,
          value: value * b.value,
          numerator: numerator * b.numerator,
          denominator: denominator * b.denominator,
          decimalPlaces: decimalPlaces,
          unit: unit,
          type: type,
        );
        // r.toSimplify();
        return (r);
      default:
        return (MyNumber(
          id: id,
          valueText: valueText,
          value: value * b.value,
          numerator: numerator,
          denominator: denominator,
          decimalPlaces: decimalPlaces,
          unit: unit,
          type: type,
        ));
    }
  }

  MyNumber operator /(MyNumber b) {
    switch (type) {
      case KeyDataType.fractions:
        num bValue = b.value == 0 ? 1 : b.value;
        MyNumber r = MyNumber(
          id: id,
          valueText: valueText,
          value: value / bValue,
          numerator: numerator * b.denominator,
          denominator: denominator * b.numerator,
          decimalPlaces: decimalPlaces,
          unit: unit,
          type: type,
        );
        // r.toSimplify();
        return (r);
      default:
        return (MyNumber(
          id: id,
          valueText: valueText,
          value: value / b.value,
          numerator: numerator,
          denominator: denominator,
          decimalPlaces: decimalPlaces,
          unit: unit,
          type: type,
        ));
    }
  }

  MyNumber operator %(MyNumber b) {
    switch (type) {
      default:
        return (MyNumber(
          id: id,
          valueText: valueText,
          value: value % b.value,
          numerator: numerator,
          denominator: denominator,
          decimalPlaces: decimalPlaces,
          unit: unit,
          type: type,
        ));
    }
  }

  bool operator <(MyNumber other) {
    return (getValue() < other.getValue());
  }

  bool operator <=(MyNumber other) {
    return (getValue() <= other.getValue());
  }

  bool operator >(MyNumber other) {
    return (getValue() > other.getValue());
  }

  bool operator >=(MyNumber other) {
    return (getValue() >= other.getValue());
  }

  void clone(MyNumber other) {
    id = other.id;
    valueText = other.valueText;
    value = other.value;
    numerator = other.numerator;
    denominator = other.denominator;
    decimalPlaces = other.decimalPlaces;
    unit = other.unit;
    type = other.type;
  }

  String toHourText() {
    valueText = "";
    if (value == 0) {
      valueText = numerator == 0
          ? "0"
          : denominator == 0
          ? "0"
          : "\\frac{$numerator}{$denominator}";
    } else {
      valueText = numerator == 0
          ? "$value"
          : denominator == 0
          ? "$value"
          : "$value\\frac{$numerator}{$denominator}";
    }
    return (valueText);
  }

  String toMinutesText() {
    return ("$value");
  }

  String toFractionsText() {
    valueText = "";
    if (value == 0) {
      if (denominator != 0) {
        valueText = "\\frac{$numerator}{$denominator}";
      }
    } else {
      if (denominator == 0) {
        valueText = "$value";
      } else {
        valueText = "$value\\frac{$numerator}{$denominator}";
      }
    }
    return (valueText);
  }

  String toClockFormat() {
    valueText =
        "${value.toString().padLeft(2, '0')}:${numerator.toString().padLeft(2, '0')}";
    return (valueText);
  }

  String getHourText() {
    return (value.toString().padLeft(2, '0'));
  }

  String getMinuteText() {
    return (numerator.toString().padLeft(2, '0'));
  }

  String getValueText() {
    return (value.toString());
  }

  String getNumText() {
    return (numerator.toString());
  }

  String getDenText() {
    return (denominator.toString());
  }

  String getValueIText() {
    return (getValI().toString());
  }

  String getValueIAbsText() {
    return (getValI().abs().toString());
  }

  @override
  String toString() {
    switch (type) {
      case KeyDataType.integer:
        return ("${getValue()}");
      case KeyDataType.double:
        String text = value.toString();
        // String text = sprintf("%s", [
        //   sprintf("%%.%df", [decimalPlaces.toInt()])
        // ]);
        return (text);
      case KeyDataType.fractions:
        return (toFractionsText());
      case KeyDataType.percents:
        return ("${getValue()}\\%");
      case KeyDataType.measurement:
        //return (sprintf("%d \\text{ %s}", [getVal(), unit]));
        return (toMeasurementText());
      case KeyDataType.hours:
        return (toHourText());
      case KeyDataType.minutes:
        return (toMinutesText());
      case KeyDataType.clock:
        return (toClockFormat());
      default:
        return (valueText);
    }
  }

  String setRomanText(LibRoman libRoman) {
    type = KeyDataType.roman;
    valueText = "\\text{${libRoman.numberToRoman(getValue().toInt())}}";
    return (valueText);
  }

  num getValue() {
    switch (type) {
      case KeyDataType.double:
        return (value.toDouble());
      case KeyDataType.fractions:
      case KeyDataType.clock:
        return (getValueFractions());
      default:
        return (value.toInt());
    }
  }

  int getValI() {
    return (value.toInt());
  }

  num getVal() {
    return (value);
  }

  int getNum() {
    return (numerator);
  }

  int getDen() {
    return (denominator);
  }

  num getValueFractions() {
    return (((value * denominator) + numerator) / denominator);
  }

  num getValueAsPercents() {
    return (getValue() * 100);
  }

  bool isFraction() {
    return (numerator != 0);
  }

  bool isEqual(MyNumber other) {
    switch (type) {
      case KeyDataType.fractions:
      case KeyDataType.hours:
      case KeyDataType.minutes:
      case KeyDataType.clock:
        return ((value.toInt() == other.value.toInt()) &&
            (getNum() == other.getNum()) &&
            (getDen() == other.getDen()));
      default:
        return (getValue() == other.getValue());
    }
  }

  bool isEqualI(int other) {
    return (getValue() == other);
  }

  String getUnit() {
    return (unit);
  }

  String toMeasurementText() {
    valueText = "";
    if (value == 0) {
      if (numerator * denominator == 0) {
        valueText = "$value";
      } else {
        valueText = "\\frac{$numerator}{$denominator}";
      }
    } else {
      if (numerator * denominator == 0) {
        valueText = "$value";
      } else {
        valueText = "$value\\frac{$numerator}{$denominator}";
      }
    }
    valueText = "$valueText\\text{ $unit}";
    return (valueText);
  }

  void toCorrectClockFormat(int maxHour) {
    if (numerator == 60) {
      value = value + 1 <= maxHour ? value + 1 : value - 1;
      numerator = 0;
      toString();
    }
  }

  void toUniqueClockFormat(MyNumber other, int maxHour) {
    if (isEqual(other)) {
      value = value + 1 <= maxHour ? value + 1 : value - 1;
      toString();
    }
  }

  String toClockFormatedText(String textHour, String textMinute) {
    return ("\\begin{gathered}${getValI()} _{\\text{ $textHour }} \\normalsize{${getNum()}} _{\\text{ $textMinute}}\\end{gathered}");
  }

  void numeratorLessThanDenominatorAndNotEqual() {
    if (numerator == denominator) {
      denominator = denominator - 1 > 1 ? denominator - 1 : denominator + 1;
    }

    int numerator_ = numerator;
    if (numerator > denominator) {
      numerator = denominator;
      denominator = numerator_;
    }
  }

  void toImproperFractions() {
    numerator = (value * denominator).toInt() + numerator;
    value = 0;
  }

  void toMixedFractions() {
    value = numerator ~/ denominator;
    numerator = numerator % denominator;
    toFractionsText();
  }

  bool isImproperFraction() {
    return (numerator > denominator);
  }

  void setNumeratorLargeThanDenominator() {
    int numerator_ = numerator;
    if (numerator < denominator) {
      numerator = denominator;
      denominator = numerator_;
    }
  }

  int getSign() {
    return (value.sign.toInt());
  }
}
