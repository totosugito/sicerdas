import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'roman_addition.dart';
import 'roman_number_to_roman.dart';
import 'roman_roman_to_number.dart';
import 'roman_subtraction.dart';

class TopicRoman extends BaseMmTopic {
  late RomanNumberToRoman _romanNumberToRoman;
  late RomanRomanToNumber _romanRomanToNumber;
  late RomanAddition _romanAddition;
  late RomanSubtraction _romanSubtraction;

  TopicRoman(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.romanNumberToRoman:
        _romanNumberToRoman = RomanNumberToRoman.init(chapter, mdChapter);
        break;
      case KeyChapter.romanRomanToNumber:
        _romanRomanToNumber = RomanRomanToNumber.init(chapter, mdChapter);
        break;
      case KeyChapter.romanAddition:
        _romanAddition = RomanAddition.init(chapter, mdChapter);
        break;
      case KeyChapter.romanSubtraction:
        _romanSubtraction = RomanSubtraction.init(chapter, mdChapter);
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
      case KeyChapter.romanNumberToRoman:
        return (_romanNumberToRoman.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      case KeyChapter.romanRomanToNumber:
        return (_romanRomanToNumber.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      case KeyChapter.romanAddition:
        return (_romanAddition.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      case KeyChapter.romanSubtraction:
        return (_romanSubtraction.newQuestion(
          padMode: padMode,
          resetData: resetData,
        ));
      default:
        return (ModelQuestion.empty());
    }
  }

  void updateSolution(ModelQuestion question, {required String solutionText}) {
    switch (keyChapter) {
      case KeyChapter.romanNumberToRoman:
        _romanNumberToRoman.updateSolution(
          question,
          solutionText: solutionText,
          solveTheQuestionText: '',
          stepsAdditionTables: '',
          stepsThereforeResult: '',
        );
        break;
      case KeyChapter.romanRomanToNumber:
        _romanRomanToNumber.updateSolution(
          question,
          solutionText: solutionText,
          solveTheQuestionText: '',
          stepsAdditionTables: '',
          stepsThereforeResult: '',
        );
        break;
      case KeyChapter.romanAddition:
        _romanAddition.updateSolution(
          question,
          solutionText: solutionText,
          solveTheQuestionText: '',
          stepsAdditionTables: '',
          stepsThereforeResult: '',
        );
        break;
      case KeyChapter.romanSubtraction:
        _romanSubtraction.updateSolution(
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
