import 'models/enums.dart';
import 'models/cl_mm_chapter.dart';
import 'models/model_chapter.dart';
import 'models/model_question.dart';
import 'modules/addition/topic_addition.dart';
import 'modules/clock/topic_clock.dart';
import 'modules/division/topic_division.dart';

class LibMathMaster {
  static T? _enumFromString<T>(Iterable<T> values, String value) {
    for (var val in values) {
      if (val.toString().split(".").last == value) {
        return val;
      }
    }
    return null;
  }

  final ClMmChapter _chapter;
  final ModelChapter _mdChapter;

  late TopicAddition _topicAddition;
  late TopicClock _topicClock;
  late TopicDivision _topicDivision;

  LibMathMaster.init(this._chapter, this._mdChapter) {
    KeyChapter keyChapter = _enumFromString(
      KeyChapter.values,
      _mdChapter.chapterKey,
    )!;
    switch (_mdChapter.topic) {
      case KeyTopic.topicAddition:
        _topicAddition = TopicAddition(_chapter, _mdChapter, keyChapter);
        break;
      case KeyTopic.topicClock:
        _topicClock = TopicClock(_chapter, _mdChapter, keyChapter);
        break;
      case KeyTopic.topicDivision:
        _topicDivision = TopicDivision(_chapter, _mdChapter, keyChapter);
        break;
      default:
        break;
    }
  }

  ModelQuestion newQuestion({
    required KeyPadMode padMode,
    bool resetData = true,
  }) {
    switch (_mdChapter.topic) {
      case KeyTopic.topicAddition:
        return _topicAddition.createQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyTopic.topicClock:
        return _topicClock.createQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyTopic.topicDivision:
        return _topicDivision.createQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      default:
        return ModelQuestion.empty();
    }
  }

  void updateSolution(ModelQuestion question, {required String solutionText}) {
    switch (_mdChapter.topic) {
      case KeyTopic.topicAddition:
        _topicAddition.updateSolution(question, solutionText: solutionText);
        break;
      case KeyTopic.topicClock:
        _topicClock.updateSolution(question, solutionText: solutionText);
        break;
      case KeyTopic.topicDivision:
        _topicDivision.updateSolution(question, solutionText: solutionText);
        break;
      default:
        break;
    }
  }
}
