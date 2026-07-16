import '../../models/enums.dart';
import '../../models/my_number.dart';
import 'subtraction_2_digit.dart';

class SubtractionSimple extends Subtraction2Digit {
  SubtractionSimple.init(super.chapter, super.mdChapter) : super.init();

  @override
  String getQuestionTemplate() {
    return ("\\begin{aligned} @0 \\\\[-0.5em] \\underline{@1} &\\space {_-}\\\\[-0.5em] @2 \\end{aligned}");
  }

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();
    MyNumber val0 = MyNumber.nextInt(myRandom: myRandom, minMax: getChapterNumRange(selectedRangeIndex, 0));
    MyNumber val1 = MyNumber.nextInt(myRandom: myRandom, minMax: getChapterNumRange(selectedRangeIndex, 1));

    numbers = [];
    numbers.add(val0 > val1 ? val0 : val1);
    numbers.add(val0 > val1 ? val1 : val0);
    answer = numbers[0] - numbers[1];

    num spacing = getChapterNumRange(selectedRangeIndex, 0).getSpacing();
    choices = createChoiceIntegerSimple(spacing: spacing.toInt());
  }
}
