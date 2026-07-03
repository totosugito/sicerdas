import 'model_choice.dart';
import 'model_solution.dart';
import 'my_number.dart';

class ModelQuestion {
  int id = -1;
  String prefix = "";
  String question = "";
  bool hasImage = false;
  ModelSolution solution = ModelSolution.empty();
  String prefixAnswer = "=answer";
  List<ModelChoice> choices = [];
  List<ModelChoice> choicesBool = [];
  bool hasSolution = false;

  ModelQuestion.clone(m) {
    empty();
    cloneObject(m);
  }

  ModelQuestion.empty() {
    empty();
  }

  ModelQuestion({
    this.id = -1,
    required this.question,
    required this.choices,
    required this.choicesBool,
    this.hasSolution = false,
    required this.solution,
    this.prefixAnswer = "=answer",
  });

  empty({int maxChoice = 5}) {
    id = -1;
    prefix = "";
    question = ".";
    hasImage = false;
    hasSolution = false;
    solution = ModelSolution.empty();
    prefixAnswer = "=answer";
    choices = [];
    choicesBool = [];
    for (int i = 0; i < maxChoice; i++) {
      bool status = i == 0 ? true : false;
      ModelChoice m = ModelChoice(id: i, status: status, value: MyNumber(value: i + 1));
      choices.add(m);
      if (i < 2) {
        ModelChoice m0 = ModelChoice(id: i, status: status, value: MyNumber(value: i + 1));
        choicesBool.add(m0);
      }
    }
  }

  void cloneObject(m) {
    id = m.id;
    prefix = m.prefix;
    question = m.question;
    hasImage = m.hasImage;
    solution = m.solution;
    prefixAnswer = m.prefixAnswer;
    hasSolution = m.hasSolution;
    for (int i = 0; i < m.choices.length; i++) {
      choices[i].cloneObject(m.choices[i]);
    }
    for (int i = 0; i < m.choicesBool.length; i++) {
      choicesBool[i].cloneObject(m.choicesBool[i]);
    }
    solution.clone(m.solution);
  }

  String getQuestion() {
    return (question);
  }

  String getChoiceText(int idx) {
    return (choices[idx].getText());
  }

  ModelChoice getChoice(int idx) {
    return (choices[idx]);
  }

  ModelChoice getChoiceBool(int idx) {
    return (choicesBool[idx]);
  }

  String getCorrectAnswer() {
    var v = choices.where((element) => element.status == true);
    var mc = v.first;
    return (mc.getText());
  }
}
