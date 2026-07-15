import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'length_conversion.dart';
import 'length_addition.dart';
import 'length_subtraction.dart';

class TopicLength extends BaseMmTopic {
  late LengthConversion _lengthConversion;
  late LengthAddition _lengthAddition;
  late LengthSubtraction _lengthSubtraction;

  TopicLength(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.lengthConversion:
        _lengthConversion = LengthConversion.init(chapter, mdChapter);
        break;
      case KeyChapter.lengthAddition:
        _lengthAddition = LengthAddition.init(chapter, mdChapter);
        break;
      case KeyChapter.lengthSubtraction:
        _lengthSubtraction = LengthSubtraction.init(chapter, mdChapter);
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
      case KeyChapter.lengthConversion:
        return (_lengthConversion.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      case KeyChapter.lengthAddition:
        return (_lengthAddition.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      case KeyChapter.lengthSubtraction:
        return (_lengthSubtraction.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      default:
        return (ModelQuestion.empty());
    }
  }

  void updateSolution(ModelQuestion question, {required String solutionText}) {
    switch (keyChapter) {
      case KeyChapter.lengthConversion:
        _lengthConversion.updateSolution(
          question,
          solutionText: solutionText,
          solveTheQuestionText: '',
          stepsAdditionTables: '',
          stepsThereforeResult: '',
        );
        break;
      case KeyChapter.lengthAddition:
        _lengthAddition.updateSolution(
          question,
          solutionText: solutionText,
          solveTheQuestionText: '',
          stepsAdditionTables: '',
          stepsThereforeResult: '',
        );
        break;
      case KeyChapter.lengthSubtraction:
        _lengthSubtraction.updateSolution(
          question,
          solutionText: solutionText,
          solveTheQuestionText: '',
          stepsAdditionTables: '',
          stepsThereforeResult: '',
        );
        break;
      default:
        break;
    }
  }
}
