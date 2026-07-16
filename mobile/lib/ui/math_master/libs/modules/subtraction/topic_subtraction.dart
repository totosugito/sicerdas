import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'subtraction_1_digit.dart';
import 'subtraction_2_digit.dart';
import 'subtraction_missing_digit.dart';
import 'subtraction_negative.dart';
import 'subtraction_simple.dart';

class TopicSubtraction extends BaseMmTopic {
  late Subtraction1Digit _subtraction1Digit;
  late Subtraction2Digit _subtraction2Digit;
  late SubtractionNegative _subtractionNegative;
  late SubtractionMissingDigit _subtractionMissingDigit;
  late SubtractionSimple _subtractionSimple;

  TopicSubtraction(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.subtractionSequential:
      case KeyChapter.subtraction1Digit:
        _subtraction1Digit = Subtraction1Digit.init(chapter, mdChapter);
        break;
      case KeyChapter.subtraction2Digit:
      case KeyChapter.subtraction3Digit:
      case KeyChapter.subtraction4Digit:
        _subtraction2Digit = Subtraction2Digit.init(chapter, mdChapter);
        break;
      case KeyChapter.subtractionSimple:
        _subtractionSimple = SubtractionSimple.init(chapter, mdChapter);
        break;
      case KeyChapter.subtractionNegative:
        _subtractionNegative = SubtractionNegative.init(chapter, mdChapter);
        break;
      case KeyChapter.subtractionMissingDigit:
        _subtractionMissingDigit = SubtractionMissingDigit.init(chapter, mdChapter);
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
      case KeyChapter.subtractionSequential:
      case KeyChapter.subtraction1Digit:
        return _subtraction1Digit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.subtraction2Digit:
      case KeyChapter.subtraction3Digit:
      case KeyChapter.subtraction4Digit:
        return _subtraction2Digit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.subtractionSimple:
        return _subtractionSimple.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.subtractionNegative:
        return _subtractionNegative.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.subtractionMissingDigit:
        return _subtractionMissingDigit.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      default:
        return ModelQuestion.empty();
    }
  }

  void updateSolution(ModelQuestion question, {required String solutionText}) {
    switch (keyChapter) {
      case KeyChapter.subtractionSequential:
      case KeyChapter.subtraction1Digit:
        _subtraction1Digit.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.subtraction2Digit:
      case KeyChapter.subtraction3Digit:
      case KeyChapter.subtraction4Digit:
        _subtraction2Digit.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.subtractionSimple:
        _subtractionSimple.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.subtractionNegative:
        _subtractionNegative.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.subtractionMissingDigit:
        _subtractionMissingDigit.updateSolution(
          question,
          solutionText: solutionText,
        );
        break;
      default:
        break;
    }
  }
}
