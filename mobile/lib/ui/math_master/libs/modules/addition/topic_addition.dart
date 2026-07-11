import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'addition_1_digit.dart';
import 'addition_2_digit.dart';
import 'addition_3_number.dart';
import 'addition_missing_digit.dart';
import 'addition_negative.dart';
import 'addition_simple.dart';

class TopicAddition extends BaseMmTopic {
  late Addition1Digit _addition1digit;
  late Addition2Digit _addition2digit;
  late Addition3Number _addition3number;
  late AdditionMissingDigit _additionMissingDigit;
  late AdditionNegative _additionNegative;
  late AdditionSimple _additionSimple;

  TopicAddition(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.additionSequential:
      case KeyChapter.addition1Digit:
        _addition1digit = Addition1Digit.init(chapter, mdChapter);
        break;
      case KeyChapter.addition2Digit:
      case KeyChapter.addition3Digit:
      case KeyChapter.addition4Digit:
        _addition2digit = Addition2Digit.init(chapter, mdChapter);
        break;
      case KeyChapter.additionThreeNumber:
        _addition3number = Addition3Number.init(chapter, mdChapter);
        break;
      case KeyChapter.additionMissingDigit:
        _additionMissingDigit = AdditionMissingDigit.init(chapter, mdChapter);
        break;
      case KeyChapter.additionNegative:
        _additionNegative = AdditionNegative.init(chapter, mdChapter);
        break;
      case KeyChapter.additionSimple:
        _additionSimple = AdditionSimple.init(chapter, mdChapter);
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
        return _addition1digit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.addition2Digit:
      case KeyChapter.addition3Digit:
      case KeyChapter.addition4Digit:
        return _addition2digit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.additionThreeNumber:
        return _addition3number.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.additionMissingDigit:
        return _additionMissingDigit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.additionNegative:
        return _additionNegative.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.additionSimple:
        return _additionSimple.newQuestion(
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
        _addition1digit.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.addition2Digit:
      case KeyChapter.addition3Digit:
      case KeyChapter.addition4Digit:
        _addition2digit.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.additionThreeNumber:
        _addition3number.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.additionMissingDigit:
        _additionMissingDigit.updateSolution(
          question,
          solutionText: solutionText,
        );
        break;
      case KeyChapter.additionNegative:
        _additionNegative.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.additionSimple:
        _additionSimple.updateSolution(question, solutionText: solutionText);
        break;
      default:
        break;
    }
  }
}
