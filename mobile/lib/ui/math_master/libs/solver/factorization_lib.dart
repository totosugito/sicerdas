import 'dart:math';
import 'libs/math_lib.dart';
import '../models/my_number.dart';

class FactorizationLib extends LibMath {
  late List<int> treeFactor;

  int fastGcf(List<MyNumber> numbers) {
    return (gcf(myNumberToIntList(numbers)));
  }

  int fastLcm(List<MyNumber> numbers) {
    return (lcm(myNumberToIntList(numbers)));
  }

  List<List<int>> createTreeFactor(List<MyNumber> data) {
    List<List<int>> result = [];
    int dataCheck;
    int denominator;
    int residue;

    //loop over data
    for (var item in data) {
      dataCheck = item.getValI();

      List<int> tempResult = [];
      tempResult.add(0);
      tempResult.add(dataCheck);
      while (true) {
        denominator = 2;

        //loop until until no residue
        while (true) {
          residue = dataCheck % denominator;
          if (residue == 0) {
            dataCheck = dataCheck ~/ denominator;
            tempResult.add(denominator);
            tempResult.add(dataCheck);
            break;
          }
          denominator += 1;
        }

        // finish process
        if (dataCheck == 1) {
          break;
        }
      }

      // save data
      result.add(tempResult);
    }
    return (result);
  }

  List<Map<int, int>> createTreeFactorGroup(List<List<int>> trees) {
    List<Map<int, int>> treeGroup = [];
    for (var tree in trees) {
      // get primeFactor = [2 2 2 3 3]
      List<int> primeFactor = [];
      for (int j = 2; j < tree.length; j += 2) {
        primeFactor.add(tree[j]);
      }

      // create primeGroup [2 2 2 3 3] = {2: 3, 3: 2}
      Map<int, int> primeGroup = {};
      for (var key in primeFactor) {
        primeGroup[key] = (primeGroup[key] ?? 0) + 1;
      }
      treeGroup.add(primeGroup);
    }
    return (treeGroup);
  }

  Map<int, int> createGcfRank(List<Map<int, int>> treeGroup) {
    Map<int, int> gcf = {};
    if (treeGroup.length < 2) {
      return (gcf);
    }

    Map<int, int> first = treeGroup[0];
    for (var key in first.keys) {
      bool allHas = true;
      int minPower = first[key]!;

      for (int i = 1; i < treeGroup.length; i++) {
        if (!treeGroup[i].containsKey(key)) {
          allHas = false;
          break;
        } else {
          minPower = min(minPower, treeGroup[i][key]!);
        }
      }

      if (allHas) {
        gcf[key] = minPower;
      }
    }
    return (gcf);
  }

  Map<int, int> createLcmRank(List<Map<int, int>> treeGroup) {
    Map<int, int> lcm = {};
    for (var group in treeGroup) {
      for (var key in group.keys) {
        lcm[key] = max(lcm[key] ?? 0, group[key]!);
      }
    }
    return (lcm);
  }
}
