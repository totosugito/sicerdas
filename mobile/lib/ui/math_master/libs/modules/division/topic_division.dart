import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'division_1_digit.dart';
import 'division_2_digit.dart';

class TopicDivision extends BaseMmTopic {
  late Division1Digit _division1Digit;
  late Division2Digit _division2Digit;

  TopicDivision(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.divisionSequential:
      case KeyChapter.division1Digit:
        _division1Digit = Division1Digit.init(chapter, mdChapter);
        break;
      case KeyChapter.division2Digit:
      case KeyChapter.division3Digit:
      case KeyChapter.divisionSimple:
        _division2Digit = Division2Digit.init(chapter, mdChapter);
        break;
      default:
        break;
    }
  }

  ModelQuestion createQuestion({
    required KeyPadMode padMode,
    bool resetData = true,
  }) {
    switch (keyChapter) {
      case KeyChapter.divisionSequential:
      case KeyChapter.division1Digit:
        return (_division1Digit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      case KeyChapter.division2Digit:
      case KeyChapter.division3Digit:
      case KeyChapter.divisionSimple:
        return (_division2Digit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      default:
        return (ModelQuestion.empty());
    }
  }

  void updateSolution(ModelQuestion question, {required String solutionText}) {
    switch (keyChapter) {
      case KeyChapter.divisionSequential:
      case KeyChapter.division1Digit:
        _division1Digit.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.division2Digit:
      case KeyChapter.division3Digit:
      case KeyChapter.divisionSimple:
        _division2Digit.updateSolution(question, solutionText: solutionText);
        break;
      default:
        break;
    }
  }
}
