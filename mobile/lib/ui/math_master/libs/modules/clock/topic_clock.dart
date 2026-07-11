import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'clock_elasped_time.dart';
import 'clock_hours_to_minutes.dart';
import 'clock_minutes_to_hours.dart';

class TopicClock extends BaseMmTopic {
  late ClockMinutesToHours _clockMinutesToHours;
  late ClockHoursToMinutes _clockHoursToMinutes;
  late ClockElapsedTime _clockElapsedTime;

  TopicClock(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.clockMinutesToHours:
        _clockMinutesToHours = ClockMinutesToHours.init(chapter, mdChapter);
        break;
      case KeyChapter.clockHoursToMinutes:
        _clockHoursToMinutes = ClockHoursToMinutes.init(chapter, mdChapter);
        break;
      case KeyChapter.clockElapsedTime:
        _clockElapsedTime = ClockElapsedTime.init(chapter, mdChapter);
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
      case KeyChapter.clockMinutesToHours:
        return _clockMinutesToHours.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.clockHoursToMinutes:
        return _clockHoursToMinutes.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      case KeyChapter.clockElapsedTime:
        return _clockElapsedTime.newQuestion(
          padMode: padMode,
          resetData: resetData,
        );
      default:
        return ModelQuestion.empty();
    }
  }

  void updateSolution(ModelQuestion question, {required String solutionText}) {
    switch (keyChapter) {
      case KeyChapter.clockMinutesToHours:
        _clockMinutesToHours.updateSolution(
          question,
          solutionText: solutionText,
        );
        break;
      case KeyChapter.clockHoursToMinutes:
        _clockHoursToMinutes.updateSolution(
          question,
          solutionText: solutionText,
        );
        break;
      case KeyChapter.clockElapsedTime:
        _clockElapsedTime.updateSolution(question, solutionText: solutionText);
        break;
      default:
        break;
    }
  }
}
