import 'dart:math';

import '../../models/my_number.dart';

class LibMath {
  List<int> myNumberToIntList(List<MyNumber> numbers) {
    List<int> data = [];
    for (var item in numbers) {
      data.add(item.getValI());
    }
    return(data);
  }

  int gcf(List<int> data) {
    if(data.length<2) {
      return(0);
    }
    data.sort();

    int val0 = data[0];
    int val1 = data[1];
    int r = val0.gcd(val1);
    for (int i = 2; i < data.length; i++) {
      int curVal = data[i];
      r = r.gcd(curVal);
    }
    return(r);
  }

  int lcm(List<int> data) {
    data.sort();

    int val0 = data[0];
    int val1 = data[1];
    int r = (val0 * val1) ~/ val0.gcd(val1);
    for (int i = 2; i < data.length; i++) {
      int curVal = data[i];
      r = (r * curVal) ~/ r.gcd(curVal);
    }
    return (r);
  }

  int computeRank(Map<int, int> data) {
    // compute rank from map
    // ex: {2: 3, 4: 5} = 2^3 x 4^5 = 8 + 1024 = 1032
    num total = 1;
    data.forEach((key, value) {
      total *= pow(key, value);
    });
    return(total.toInt());
  }

  bool isLowestRank(Map<int, int> data) {
    // the data is the lowest rank
    // length must [1] and the rank value = 1
    // ex: {3: 1}
    bool r = false;
    if(data.length != 1) {
      return(false);
    }

    // length = 1 and the value = 1
    data.forEach((key, value) {
      if(value == 1) {
        r = true;
      }
    });
    return(r);
  }

  List<int> separateIntByUnitGroup(int value)
  {
    // separate number by unit group
    // Ex. 50123 = 50000 + 100 + 20 + 3

    List<int> result = [];
    int unit = 1; // 1, 10, 100, 1000, ...
    while (value > 0) {
      int digit = value % 10;
      value = value ~/ 10;
      if(digit!=0) {
        result.add(digit*unit);
      }
      unit *= 10;
    }
    return(List.from(result.reversed));
  }
  int computeMaxLengthIntFromList({required List<MyNumber> data}) {
    int n = 0;
    for(var item in data) {
      n = max(n, item.getValueIText().length);
    }
    return(n);
  }
  bool haveSingleDigit({required List<MyNumber> data}) {
    for(var item in data) {
      if(item.getValI()<10) {
        return(true);
      }
    }
    return(false);
  }
  List<String> intToListString(int length, int value) {
    String text = value.toString().padLeft(length);
    List<String> result = text.split("");
    return(result);
  }
  int getSign(int value) {
    return(value.sign);
  }
}