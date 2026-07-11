import '../../models/my_number.dart';
import '../../models/enums.dart';
import 'addition_2_digit.dart';

class AdditionSimple extends Addition2Digit {
  AdditionSimple.init(super.chapter, super.mdChapter) : super.init();

  @override
  createDataValue(KeyPadMode padMode) {
    int selectedRangeIndex = getSelectedRangeIndex();

    numbers = [];
    numbers.add(
      MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 0),
      ),
    );
    numbers.add(
      MyNumber.nextInt(
        myRandom: myRandom,
        minMax: getChapterNumRange(selectedRangeIndex, 1),
      ),
    );
    answer = numbers[0] + numbers[1];

    num spacing = getChapterNumRange(selectedRangeIndex, 0).getSpacing();
    choices = createChoiceIntegerSimple(spacing: spacing.toInt());
  }
}
