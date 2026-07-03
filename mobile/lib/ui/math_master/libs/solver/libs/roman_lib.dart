class LibRoman {
  final List<int> number = [1000, 500, 100, 50, 10, 5, 1];
  final List<String> numberSymbol = ["M", "D", "C", "L", "X", "V", "I"];
  final List<int> numbers = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  final List<String> numbersSymbol = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];

  LibRoman();

  int getLettersIndex(int value) {
    int n = numbers.length;
    for (int i = n - 1; i >= 0; i--) {
      if (numbers[i] > value) {
        return (i + 1);
      }
    }
    return (0);
  }

  num romanToNumber(String roman) {
    roman = roman.trim().toUpperCase();
    if (roman.isEmpty) {
      return 0;
    }

    List<String> romanChar = roman.split('');
    List<int> romanVal = romanCharToInt(romanChar);
    return (sumInt(romanVal));
  }

  List<int> romanCharToInt(List<String> data) {
    List<int> r = [];
    int n = data.length;
    for (int i = 0; i < n - 1; i++) {
      int idx0 = numberSymbol.indexOf(data[i]);
      int idx1 = numberSymbol.indexOf(data[i + 1]);
      if ((idx0 < 0) || (idx1 < 0)) {
        return ([]);
      }
      r.add(idx0 <= idx1 ? number[idx0] : -number[idx0]);
    }

    int idx0 = numberSymbol.indexOf(data[n - 1]);
    if (idx0 < 0) {
      return ([]);
    }
    r.add(number[idx0]);
    return (r);
  }

  int sumInt(List<int> data) {
    int total = 0;
    for (var value in data) {
      total += value;
    }
    return (total);
  }

  String numberToRoman(int N) {
    String roman = "";
    int lenLetters = numbers.length;
    for (int i = 0; i < lenLetters; i++) {
      while (N >= numbers[i]) {
        roman += numbersSymbol[i];
        N -= numbers[i];
      }
    }
    return roman;
  }

  bool isValid(int value) {
    String textRoman = numberToRoman(value);
    num number = romanToNumber(textRoman);
    return (number != 0 ? true : false);
  }
}
