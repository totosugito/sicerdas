import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'percents_from_fractions.dart';
import 'percents_of_number.dart';
import 'percents_to_fractions.dart';

class TopicPercents extends BaseMmTopic {
  late PercentsOfNumber _percentsOfNumber;
  late PercentsFromFractions _percentsFromFractions;
  late PercentsToFractions _percentsToFractions;

  TopicPercents(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.percentsOfNumber:
        _percentsOfNumber = PercentsOfNumber.init(chapter, mdChapter);
        break;
      case KeyChapter.percentsFromFractions:
        _percentsFromFractions = PercentsFromFractions.init(chapter, mdChapter);
        break;
      case KeyChapter.percentsToFractions:
        _percentsToFractions = PercentsToFractions.init(chapter, mdChapter);
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
      case KeyChapter.percentsOfNumber:
        return (_percentsOfNumber.newQuestion(padMode: padMode, resetData: resetData));
      case KeyChapter.percentsFromFractions:
        return (_percentsFromFractions.newQuestion(padMode: padMode, resetData: resetData));
      case KeyChapter.percentsToFractions:
        return (_percentsToFractions.newQuestion(padMode: padMode, resetData: resetData));
      default:
        return (ModelQuestion.empty());
    }
  }

  void updateSolution(
    ModelQuestion question, {
    required String solutionText,
    String? solveTheQuestionText,
    String? stepsAdditionTables,
    String? stepsThereforeResult,
  }) {
    switch (keyChapter) {
      case KeyChapter.percentsOfNumber:
        _percentsOfNumber.updateSolution(
          question,
          solutionText: solutionText,
          solveTheQuestionText: solveTheQuestionText,
          stepsAdditionTables: stepsAdditionTables,
          stepsThereforeResult: stepsThereforeResult,
        );
        break;
      case KeyChapter.percentsFromFractions:
        _percentsFromFractions.updateSolution(
          question,
          solutionText: solutionText,
          solveTheQuestionText: solveTheQuestionText,
          stepsAdditionTables: stepsAdditionTables,
          stepsThereforeResult: stepsThereforeResult,
        );
        break;
      case KeyChapter.percentsToFractions:
        _percentsToFractions.updateSolution(
          question,
          solutionText: solutionText,
          solveTheQuestionText: solveTheQuestionText,
          stepsAdditionTables: stepsAdditionTables,
          stepsThereforeResult: stepsThereforeResult,
        );
        break;
      default:
        break;
    }
  }
}
