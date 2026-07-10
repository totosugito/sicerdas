import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'addition_1_digit.dart';

class TopicAddition extends BaseMmTopic {
  late Addition1Digit _addition1digit;

  TopicAddition(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.additionSequential:
      case KeyChapter.addition1Digit:
      case KeyChapter.addition2Digit:
      case KeyChapter.addition3Digit:
      case KeyChapter.addition4Digit:
      case KeyChapter.additionNegative:
      case KeyChapter.additionMissingDigit:
      case KeyChapter.additionSimple:
        _addition1digit = Addition1Digit.init(chapter, mdChapter);
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
      case KeyChapter.additionSequential:
      case KeyChapter.addition1Digit:
      case KeyChapter.addition2Digit:
      case KeyChapter.addition3Digit:
      case KeyChapter.addition4Digit:
      case KeyChapter.additionNegative:
      case KeyChapter.additionMissingDigit:
      case KeyChapter.additionSimple:
        return _addition1digit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      default:
        return ModelQuestion.empty();
    }
  }

  void updateSolution(ModelQuestion question, {required String solutionText}) {
    switch (keyChapter) {
      case KeyChapter.additionSequential:
      case KeyChapter.addition1Digit:
      case KeyChapter.addition2Digit:
      case KeyChapter.addition3Digit:
      case KeyChapter.addition4Digit:
      case KeyChapter.additionNegative:
      case KeyChapter.additionMissingDigit:
      case KeyChapter.additionSimple:
        _addition1digit.updateSolution(question, solutionText: solutionText);
        break;
      default:
        break;
    }
  }
}
