import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'multiplication_1_digit.dart';
import 'multiplication_2_digit.dart';
import 'multiplication_missing_digit.dart';
import 'multiplication_negative.dart';
import 'multiplication_simple.dart';

class TopicMultiplication extends BaseMmTopic {
  late Multiplication1Digit _multiplication1Digit;
  late Multiplication2Digit _multiplication2Digit;
  late MultiplicationNegative _multiplicationNegative;
  late MultiplicationMissingDigit _multiplicationMissingDigit;
  late MultiplicationSimple _multiplicationSimple;

  TopicMultiplication(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.multiplicationSequential:
      case KeyChapter.multiplication1Digit:
        _multiplication1Digit = Multiplication1Digit.init(chapter, mdChapter);
        break;
      case KeyChapter.multiplication2Digit:
      case KeyChapter.multiplication3Digit:
      case KeyChapter.multiplication4Digit:
        _multiplication2Digit = Multiplication2Digit.init(chapter, mdChapter);
        break;
      case KeyChapter.multiplicationSimple:
        _multiplicationSimple = MultiplicationSimple.init(chapter, mdChapter);
        break;
      case KeyChapter.multiplicationNegative:
        _multiplicationNegative = MultiplicationNegative.init(chapter, mdChapter);
        break;
      case KeyChapter.multiplicationMissingDigit:
        _multiplicationMissingDigit = MultiplicationMissingDigit.init(chapter, mdChapter);
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
      case KeyChapter.multiplicationSequential:
      case KeyChapter.multiplication1Digit:
        return _multiplication1Digit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.multiplication2Digit:
      case KeyChapter.multiplication3Digit:
      case KeyChapter.multiplication4Digit:
        return _multiplication2Digit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.multiplicationSimple:
        return _multiplicationSimple.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.multiplicationNegative:
        return _multiplicationNegative.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.multiplicationMissingDigit:
        return _multiplicationMissingDigit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      default:
        return ModelQuestion.empty();
    }
  }

  void updateSolution(ModelQuestion question, {required String solutionText}) {
    switch (keyChapter) {
      case KeyChapter.multiplicationSequential:
      case KeyChapter.multiplication1Digit:
        _multiplication1Digit.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.multiplication2Digit:
      case KeyChapter.multiplication3Digit:
      case KeyChapter.multiplication4Digit:
        _multiplication2Digit.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.multiplicationSimple:
        _multiplicationSimple.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.multiplicationNegative:
        _multiplicationNegative.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.multiplicationMissingDigit:
        _multiplicationMissingDigit.updateSolution(
          question,
          solutionText: solutionText,
        );
        break;
      default:
        break;
    }
  }
}
