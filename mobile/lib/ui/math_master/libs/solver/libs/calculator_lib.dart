
import 'dart:math';

import '../../models/my_number.dart';
import 'math_lib.dart';

class CalculatorLib extends LibMath {
  List<List<String>> calcAddition(List<MyNumber> numbers, MyNumber answer) {
    List<List<String>> result = [];

    // get maximum length of data
    int maxLength = computeMaxLengthIntFromList(data: numbers);
    maxLength = max(maxLength, computeMaxLengthIntFromList(data: [answer]));

    // fill 1st ... answer row
    for(var item in numbers) {
      result.add(intToListString(maxLength, item.getValI()));
    }
    result.add(intToListString(maxLength, answer.getValI())); // add result/answer

    // create header
    List<String> header = List<String>.filled(maxLength, "");
    for(int i=maxLength-1; i>=0;  i--) {
      int sum = 0;
      for(int j=0; j<result.length-1; j++) {
        sum += getIntFromStringList(result[j], i);
      }
      if(sum>=10) {
        header[i-1] = "1";
      }
    }
    result.insert(0, header);
    return(result);
  }

  List<List<String>> calcSubtraction(List<MyNumber> numbers, MyNumber answer) {
    List<List<String>> result = [];

    // get maximum length of data
    int maxLength = computeMaxLengthIntFromList(data: numbers);
    maxLength = max(maxLength, computeMaxLengthIntFromList(data: [answer]));

    // fill 1st ... answer row
    for(var item in numbers) {
      result.add(intToListString(maxLength, item.getValI()));
    }
    result.add(intToListString(maxLength, answer.getValI())); // add result/answer

    // create header
    List<String> header = List<String>.filled(maxLength, "");
    for(int i=maxLength-1; i>=0;  i--) {
      // A-B = C
      // A' = B + C
      int sum = 0;
      for(int j=1; j<result.length; j++) {
        sum += getIntFromStringList(result[j], i);
      }

      String strSum = sum.toString();
      if(strSum != result[0][i]) {
        header[i] = strSum;
      }
    }
    result.insert(0, header);

    return(result);
  }

  List<List<String>> calcMultiplication(List<MyNumber> numbers, MyNumber answer) {
    List<List<String>> result = [];

    // get maximum length of data
    int maxLength = computeMaxLengthIntFromList(data: numbers);
    maxLength = max(maxLength, computeMaxLengthIntFromList(data: [answer]));

    // fill question row
    for(var item in numbers) {
      result.add(intToListString(maxLength, item.getValI()));
    }

    // compute numbers[0] with every item in numbers[1]
    List<int> mulNumber = listStringToListInt(result[0]);
    int idxStartWrite = 0; // write the result starting from last index
    for(int i=maxLength-1; i>=0; i--) {
      String itemMulText = result[1][i].trim();
      if(itemMulText.isEmpty) {
        continue;
      }

      // multiply item in numbers[1] with numbers[0]
      int mulVar = int.parse(itemMulText);
      List<String> header = List<String>.filled(maxLength, "");
      List<String> stepResult = List<String>.filled(maxLength, "");

      int itemVal = 0; // item multiplication
      int hdrVal = 0; // header
      int resVal = 0; // residue
      int idxFinal = maxLength-1-idxStartWrite;
      for(int j=mulNumber.length-1; j>=0; j--) {
        itemVal = hdrVal + (mulNumber[j] * mulVar);
        if(itemVal >= 10) {
          hdrVal = itemVal ~/ 10;
          resVal = itemVal % 10;
          header[idxFinal-1] = hdrVal.toString();
          stepResult[idxFinal] = resVal.toString();
        }
        else {
          stepResult[idxFinal] = itemVal.toString();
        }
        idxFinal -= 1;
      }

      // last result when available
      if(idxFinal >=0) {
        String lastHdrVal = header[idxFinal].trim();
        if(lastHdrVal.isNotEmpty) {
          stepResult[idxFinal] = lastHdrVal;
        }
      }

      result.add(header); // add header
      result.add(stepResult); // add step result

      idxStartWrite += 1;
    }

    // no addition step
    if(numbers[1].getValI() < 10) {
      return(result);
    }

    // add header final result
    List<String> headerFinal = List<String>.filled(maxLength, "");
    for(int i=maxLength-1; i>=0;  i--) {
      int sum = 0;
      for(int j=3; j<result.length; j+=2) {
        sum += getIntFromStringList(result[j], i);
      }
      if(sum>=10) {
        headerFinal[i-1] = "1";
      }
    }
    result.add(headerFinal); // add header final
    result.add(intToListString(maxLength, answer.getValI())); // add final result
    return(result);
  }

  List<List<String>> calcDivision(List<MyNumber> numbers, MyNumber answer) {
    List<List<String>> result = [];

    // ANSWER
    // denominator
    // numerator
    // [A]*denominator ... dMul_
    // ======= -
    // ................... dSub_
    // [N]*denominator ... dMul_
    // ======= -
    // ................... dSub_
    // [S]*denominator ... dMul_

    // get maximum length of data
    int maxLength = computeMaxLengthIntFromList(data: numbers);
    maxLength = max(maxLength, computeMaxLengthIntFromList(data: [answer]));

    int numerator = numbers[0].getValI();
    int denominator = numbers[1].getValI();
    List<String> listAnswer = intToListString(maxLength, answer.getValI());
    List<int> itemAnswer = listStringToListInt(listAnswer);

    // fill question row
    result.add(listAnswer);
    result.add(intToListString(maxLength, denominator));
    result.add(intToListString(maxLength, numerator));
    int rank = itemAnswer.length-1;

    int dStep_ = numerator;
    for(int i=0; i<itemAnswer.length; i++) {
      int rankMul_ = pow(10, rank).toInt();
      int dMul_ = denominator * itemAnswer[i];
      int dSub_ = dStep_ - (dMul_*rankMul_);

      String dMulText_ = (dMul_.toString() + rankMul_.toString().substring(1)); // 25 + "000" <-- from rank
      List<String> stepMul = dMulText_.padLeft(maxLength).split("");
      List<String> stepSub = intToListString(maxLength, dSub_);

      // remove number group
      for(int j=maxLength-rank; j<maxLength; j++) {
        stepMul[j] = " ";
      }
      for(int j=maxLength-rank+1; j<maxLength; j++) {
        stepSub[j] = " ";
      }

      result.add(stepMul);
      result.add(stepSub);

      dStep_ = dSub_;
      rank -= 1;
    }

    return(result);
  }

  int getIntFromStringList(List<String> data, int idx) {
    if(data[idx] == "-") {
      return(0);
    }
    return((data[idx].trim().isEmpty) ? 0 : int.parse(data[idx]));
  }
  bool isEmpty({required List<List<String>> data, int irow=0}) {
    List<String> check = data[irow];
    for(var item in check) {
      if(item.isNotEmpty) {
        return(false);
      }
    }
    return(true);
  }
  List<int> listStringToListInt(List<String> data) {
    List<int> result = [];

    for(var item in data) {
      String itemMulText = item.trim();
      if(itemMulText.isEmpty) {
        continue;
      }
      result.add(int.parse(itemMulText));
    }
    return(result);
  }
}