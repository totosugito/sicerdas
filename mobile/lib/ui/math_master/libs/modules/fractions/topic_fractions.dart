import '../../base/base_mm_topic.dart';
import '../../models/enums.dart';
import '../../models/model_question.dart';
import 'fractions_addition.dart';
import 'fractions_division.dart';
import 'fractions_from_mixed.dart';
import 'fractions_multiplication.dart';
import 'fractions_simplest_form.dart';
import 'fractions_subtraction.dart';
import 'fractions_to_mixed.dart';

class TopicFractions extends BaseMmTopic {
  late FractionsSimplestForm _fractionsSimplestForm;
  late FractionsFromMixed _fractionsFromMixed;
  late FractionsToMixed _fractionsToMixed;
  late FractionsAddition _fractionsAddition;
  late FractionsSubtraction _fractionsSubtraction;
  late FractionsMultiplication _fractionsMultiplication;
  late FractionsDivision _fractionsDivision;

  TopicFractions(super.chapter, super.mdChapter, super.keyChapter) {
    initTopic();
  }

  void initTopic() {
    switch (keyChapter) {
      case KeyChapter.fractionsSimplestForm:
        _fractionsSimplestForm = FractionsSimplestForm.init(chapter, mdChapter);
        break;
      case KeyChapter.fractionsFromMixed:
        _fractionsFromMixed = FractionsFromMixed.init(chapter, mdChapter);
        break;
      case KeyChapter.fractionsToMixed:
        _fractionsToMixed = FractionsToMixed.init(chapter, mdChapter);
        break;
      case KeyChapter.fractionsAddition:
        _fractionsAddition = FractionsAddition.init(chapter, mdChapter);
        break;
      case KeyChapter.fractionsSubtraction:
        _fractionsSubtraction = FractionsSubtraction.init(chapter, mdChapter);
        break;
      case KeyChapter.fractionsMultiplication:
        _fractionsMultiplication = FractionsMultiplication.init(chapter, mdChapter);
        break;
      case KeyChapter.fractionsDivision:
        _fractionsDivision = FractionsDivision.init(chapter, mdChapter);
        break;
      default:
        break;
    }
  }

  ModelQuestion createQuestion({required KeyPadMode padMode, bool resetData = true}) {
    switch (keyChapter) {
      case KeyChapter.fractionsSimplestForm:
        return (_fractionsSimplestForm.newQuestion(padMode: padMode, resetData: resetData));
      case KeyChapter.fractionsFromMixed:
        return (_fractionsFromMixed.newQuestion(padMode: padMode, resetData: resetData));
      case KeyChapter.fractionsToMixed:
        return (_fractionsToMixed.newQuestion(padMode: padMode, resetData: resetData));
      case KeyChapter.fractionsAddition:
        return (_fractionsAddition.newQuestion(padMode: padMode, resetData: resetData));
      case KeyChapter.fractionsSubtraction:
        return (_fractionsSubtraction.newQuestion(padMode: padMode, resetData: resetData));
      case KeyChapter.fractionsMultiplication:
        return (_fractionsMultiplication.newQuestion(padMode: padMode, resetData: resetData));
      case KeyChapter.fractionsDivision:
        return (_fractionsDivision.newQuestion(padMode: padMode, resetData: resetData));
      default:
        return (ModelQuestion.empty());
    }
  }

  void updateSolution(ModelQuestion question, {required String solutionText}) {
    switch (keyChapter) {
      case KeyChapter.fractionsSimplestForm:
        _fractionsSimplestForm.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.fractionsFromMixed:
        _fractionsFromMixed.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.fractionsToMixed:
        _fractionsToMixed.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.fractionsAddition:
        _fractionsAddition.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.fractionsSubtraction:
        _fractionsSubtraction.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.fractionsMultiplication:
        _fractionsMultiplication.updateSolution(question, solutionText: solutionText);
        break;
      case KeyChapter.fractionsDivision:
        _fractionsDivision.updateSolution(question, solutionText: solutionText);
        break;
      default:
        break;
    }
  }
}
