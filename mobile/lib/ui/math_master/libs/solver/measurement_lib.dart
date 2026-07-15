import '../models/enums.dart';
import '../models/my_number.dart';
import '../models/unit_measurement.dart';

class MeasurementLib {
  late List<UnitMeasurement> unitOfMeasurements;
  late KeyMeasurement keyMeasurement;

  MeasurementLib.initLength() {
    keyMeasurement = KeyMeasurement.length;
    unitOfMeasurements = [];
    unitOfMeasurements.add(UnitMeasurement(
      id: 0,
      symbol: "km",
      label: "",
      toBase: "x*1000",
      fromBase: "x/1000",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 1,
      symbol: "hm",
      label: "",
      toBase: "x*100",
      fromBase: "x/100",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 2,
      symbol: "dam",
      label: "",
      toBase: "x*10",
      fromBase: "x/10",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 3,
      symbol: "m",
      label: "",
      toBase: "x",
      fromBase: "x",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 4,
      symbol: "dm",
      label: "",
      toBase: "x/10",
      fromBase: "x*10",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 5,
      symbol: "cm",
      label: "",
      toBase: "x/100",
      fromBase: "x*100",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 6,
      symbol: "mm",
      label: "",
      toBase: "x/1000",
      fromBase: "x*1000",
    ));
  }

  MeasurementLib.initWeight() {
    keyMeasurement = KeyMeasurement.weight;
    unitOfMeasurements = [];
    unitOfMeasurements.add(UnitMeasurement(
      id: 0,
      symbol: "kg",
      label: "",
      toBase: "x*1000",
      fromBase: "x/1000",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 1,
      symbol: "hg",
      label: "",
      toBase: "x*100",
      fromBase: "x/100",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 2,
      symbol: "dag",
      label: "",
      toBase: "x*10",
      fromBase: "x/10",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 3,
      symbol: "g",
      label: "",
      toBase: "x",
      fromBase: "x",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 4,
      symbol: "dg",
      label: "",
      toBase: "x/10",
      fromBase: "x*10",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 5,
      symbol: "cg",
      label: "",
      toBase: "x/100",
      fromBase: "x*100",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 6,
      symbol: "mg",
      label: "",
      toBase: "x/1000",
      fromBase: "x*1000",
    ));
    unitOfMeasurements.add(UnitMeasurement(
      id: 7,
      symbol: "ons",
      label: "",
      toBase: "x*100",
      fromBase: "x/100",
    ));
  }

  int getUnitLength() {
    return (unitOfMeasurements.length);
  }

  UnitMeasurement getUnit(int idx) {
    return (unitOfMeasurements[idx]);
  }

  num evaluateBaseFormula(String formula, num x) {
    if (formula == 'x') return x;
    if (formula.startsWith('x*')) {
      num factor = num.parse(formula.substring(2));
      return x * factor;
    }
    if (formula.startsWith('x/')) {
      num divisor = num.parse(formula.substring(2));
      return x / divisor;
    }
    throw ArgumentError('Unsupported formula: $formula');
  }

  num getMultiplierConst(int idx0, int idx1) {
    UnitMeasurement unit0 = unitOfMeasurements[idx0];
    UnitMeasurement unit1 = unitOfMeasurements[idx1];

    num x = 1;
    num val0 = evaluateBaseFormula(unit0.getToBase(), x);
    num val1 = evaluateBaseFormula(unit1.getToBase(), x);

    return (val0 / val1);
  }

  num convertUnit(MyNumber from, MyNumber target) {
    num result = 0;
    num multiplier = getMultiplierConst(from.id, target.id);
    result = from.value * multiplier;
    return (result);
  }

  num unitAdd(
    List<MyNumber> list,
    List<KeyCalcMethod> calcMethod,
    MyNumber target,
  ) {
    num result = 0;

    int idx = 0;
    for (MyNumber item in list) {
      switch (calcMethod[idx]) {
        case KeyCalcMethod.add:
          result += convertUnit(item, target);
          break;
        case KeyCalcMethod.sub:
          result -= convertUnit(item, target);
          break;
        case KeyCalcMethod.mul:
          result *= convertUnit(item, target);
          break;
        case KeyCalcMethod.div:
          result /= convertUnit(item, target);
          break;
      }

      idx += 1;
    }
    return (result);
  }
}
