import 'package:bse/i18n/strings.g.dart';
import '../models/my_number.dart';
import 'factorization_lib.dart';
import 'libs/html_lib.dart';

class FactorizationSteps extends LibHtml {
  late FactorizationLib lib;

  FactorizationSteps({required List<MyNumber> numbers, required MyNumber answer}) : super(numbers, answer) {
    lib = FactorizationLib();
  }

  int longSpace = 10;
  int shortSpace = 3;

  String _htmlTreeFactor(String label, int checkNumber, List<int> tree) {
    String html = span(id: idStepsLabel, value: sprintf(label, [b(checkNumber.toString()), br()]));
    String htmlTree = sprintf("%s%d%s\n", [nSpace(longSpace + 1), tree[1], br()]);

    int spaceL = longSpace;
    int spaceR = longSpace + shortSpace;
    for (int i = 2; i < tree.length; i += 2) {
      int lNum = tree[i];
      int rNum = tree[i + 1];
      int rnNum = rNum.toString().length;
      htmlTree += sprintf("%s/%s\\%s\n", [nSpace(spaceL), nSpace(shortSpace), br()]);
      htmlTree +=
          sprintf("%s%s%s%d%s\n", [nSpace(spaceL - rnNum), b(lNum.toString()), nSpace(shortSpace + rnNum), rNum, br()]);
      spaceL = spaceR;
      spaceR = spaceR + shortSpace;
    }
    html += htmlTree;
    return (html);
  }

  String _htmlPrimeFactorization(String label, int checkNumber, List<int> tree, Map<int, int> group) {
    String html = span(id: idStepsLabel, value: sprintf(label, [b(checkNumber.toString()), br()]));
    html += span(id: idStepsValue, value: listIntToString(data: tree, separator: times(), start: 2, spacing: 2));
    if (listLength(data: tree, start: 2, spacing: 2) != group.length) {
      html +=
          equal() + span(id: idStepsValue, value: mapRankIntToString(data: group, separator: times(), showAll: false));
    }
    return (html);
  }

  String _htmlGetFactorization(String label, Map<int, int> data, int result) {
    String html = span(id: idStepsLabel, value: sprintf(label, [br()]));
    html += span(id: idStepsValue, value: mapRankIntToString(data: data, separator: times(), showAll: false));
    if (!lib.isLowestRank(data)) {
      html += equal() + span(id: idStepsValue, value: result.toString());
    }
    return (html);
  }

  String _htmlResult(String label, int result) {
    String html = span(
        id: idStepsLabel,
        value: sprintf(label, [
          listNumbersIntToString(
              data: numbers, lastSeparator: sprintf(" %s ", [t.math_master.solver.and_text])),
          br()
        ]));
    html += span(id: idFinalAnswer, value: result.toString());
    return (html);
  }

  String toHtmlGcf() {
    List<List<int>> trees = lib.createTreeFactor(numbers);
    List<Map<int, int>> treeGroup = lib.createTreeFactorGroup(trees);
    Map<int, int> gcfRank = lib.createGcfRank(treeGroup);
    int gcf = lib.computeRank(gcfRank);

    if (gcf < 2) {
      return (t.math_master.solver.steps_no_solution);
    }

    String html = "";
    String label1 = t.math_master.solver.steps_factorization_1;
    String label2 = t.math_master.solver.steps_factorization_2;
    for (int i = 0; i < numbers.length; i++) {
      // 1. create html tree factor
      html += liSpan(value: _htmlTreeFactor(label1, numbers[i].getValI(), trees[i]));

      // 2. prime factorization
      html += liSpan(value: _htmlPrimeFactorization(label2, numbers[i].getValI(), trees[i], treeGroup[i]));
    }

    // 3. get gcf
    String label3 = t.math_master.solver.steps_factorization_3;
    html += liSpan(value: _htmlGetFactorization(label3, gcfRank, gcf));

    // 4. show result
    String label4 = t.math_master.solver.steps_factorization_4;
    html += liSpan(value: _htmlResult(label4, gcf));

    return (ol(value: html));
  }

  String toHtmlLcm() {
    List<List<int>> trees = lib.createTreeFactor(numbers);
    List<Map<int, int>> treeGroup = lib.createTreeFactorGroup(trees);
    Map<int, int> lcmRank = lib.createLcmRank(treeGroup);
    int lcm = lib.computeRank(lcmRank);

    if (lcm < 2) {
      return (t.math_master.solver.steps_no_solution);
    }

    String html = "";
    String label1 = t.math_master.solver.steps_factorization_1;
    String label2 = t.math_master.solver.steps_factorization_2;
    for (int i = 0; i < numbers.length; i++) {
      // 1. create html tree factor
      html += liSpan(value: _htmlTreeFactor(label1, numbers[i].getValI(), trees[i]));

      // 2. prime factorization
      html += liSpan(value: _htmlPrimeFactorization(label2, numbers[i].getValI(), trees[i], treeGroup[i]));
    }

    // 3. get factorization
    String label5 = t.math_master.solver.steps_factorization_5;
    html += liSpan(value: _htmlGetFactorization(label5, lcmRank, lcm));

    // 4. show result
    String label6 = t.math_master.solver.steps_factorization_6;
    html += liSpan(value: _htmlResult(label6, lcm));

    return (ol(value: html));
  }
}
