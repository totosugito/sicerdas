import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'weight_conversion.dart';
import 'weight_addition.dart';
import 'weight_subtraction.dart';

class TopicWeight extends BaseMmTopic {
  late WeightConversion _weightConversion;
  late WeightAddition _weightAddition;
  late WeightSubtraction _weightSubtraction;

  TopicWeight(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.weightConversion:
        _weightConversion = WeightConversion.init(chapter, mdChapter);
        break;
      case KeyChapter.weightAddition:
        _weightAddition = WeightAddition.init(chapter, mdChapter);
        break;
      case KeyChapter.weightSubtraction:
        _weightSubtraction = WeightSubtraction.init(chapter, mdChapter);
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
      case KeyChapter.weightConversion:
        return (_weightConversion.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      case KeyChapter.weightAddition:
        return (_weightAddition.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      case KeyChapter.weightSubtraction:
        return (_weightSubtraction.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      default:
        return (ModelQuestion.empty());
    }
  }

  void updateSolution(ModelQuestion question, {required String solutionText}) {
    switch (keyChapter) {
      case KeyChapter.weightConversion:
        _weightConversion.updateSolution(
          question,
          solutionText: solutionText,
          solveTheQuestionText: '',
          stepsAdditionTables: '',
          stepsThereforeResult: '',
        );
        break;
      case KeyChapter.weightAddition:
        _weightAddition.updateSolution(
          question,
          solutionText: solutionText,
          solveTheQuestionText: '',
          stepsAdditionTables: '',
          stepsThereforeResult: '',
        );
        break;
      case KeyChapter.weightSubtraction:
        _weightSubtraction.updateSolution(
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
