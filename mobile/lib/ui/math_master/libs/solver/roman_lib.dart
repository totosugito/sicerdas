import 'libs/math_lib.dart';
import 'libs/roman_lib.dart';

class RomanLib extends LibRoman {
  RomanLib() : super();

  List<int> separateIntByUnitGroup(int value) {
    return LibMath().separateIntByUnitGroup(value);
  }

  List<int> numberToRomanGroup(int value) {
    List<int> result = [];
    int idx = 0;
    while (true) {
      idx = getLettersIndex(value);
      result.add(numbers[idx]);
      value = value - numbers[idx];
      idx = idx + 1;

      if (value <= 0) {
        break;
      }
    }
    return (result);
  }

  List<List<int>> listNumberToRomanGroup(List<int> data) {
    List<List<int>> result = [];
    for (var item in data) {
      List<int> value = numberToRomanGroup(item);
      if (value.isNotEmpty) {
        result.add(value);
      }
    }
    return (result);
  }

  List<List<String>> listNumberToRomanSymbol(List<List<int>> data) {
    List<List<String>> result = [];
    for (var item in data) {
      List<String> r = [];
      for (var v in item) {
        int idx = numbers.indexOf(v);
        r.add(numbersSymbol[idx]);
      }
      result.add(r);
    }
    return (result);
  }
}
