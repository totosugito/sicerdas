import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'factorization_gcf.dart';
import 'factorization_lcm.dart';

class TopicFactorization extends BaseMmTopic {
  late FactorizationGcf _factorizationGcf;
  late FactorizationLcm _factorizationLcm;

  TopicFactorization(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.factorizationGcf:
        _factorizationGcf = FactorizationGcf.init(chapter, mdChapter);
        break;
      case KeyChapter.factorizationLcm:
        _factorizationLcm = FactorizationLcm.init(chapter, mdChapter);
        break;
      default:
        break;
    }
  }

  ModelQuestion createQuestion({required KeyPadMode padMode, bool resetData = true}) {
    switch (keyChapter) {
      case KeyChapter.factorizationGcf:
        return (_factorizationGcf.newQuestion(padMode: padMode, resetData: resetData));
      case KeyChapter.factorizationLcm:
        return (_factorizationLcm.newQuestion(padMode: padMode, resetData: resetData));
      default:
        return (ModelQuestion.empty());
    }
  }

  void updateSolution(ModelQuestion question, {required String solutionText}) {
    switch (keyChapter) {
      case KeyChapter.factorizationGcf:
        _factorizationGcf.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.factorizationLcm:
        _factorizationLcm.updateSolution(question, solutionText: solutionText);
        break;
      default:
        break;
    }
  }
}
