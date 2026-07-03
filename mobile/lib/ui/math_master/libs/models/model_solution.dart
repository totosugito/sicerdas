class ModelSolution {
  String module = "";
  String chapter = "";
  String question = "";
  String answer = "";
  String solution = "";

  _init() {
    module = "";
    chapter = "";
    question = "";
    answer = "";
    solution = "";
  }

  clone(ModelSolution other) {
    module = other.module;
    chapter = other.chapter;
    question = other.question;
    answer = other.answer;
    solution = other.solution;
  }

  ModelSolution.empty() {
    _init();
  }

  ModelSolution.clone(ModelSolution other) {
    clone(other);
  }

  ModelSolution({
    this.module = "",
    this.chapter = "",
    this.question = "",
    this.answer = "",
    this.solution = "",
  });

  String createHtml({required String html, bool isDarkMode = false}) {
    DateTime now = DateTime.now();

    String theme = isDarkMode ? "dark" : "light";
    String newHtml = html.replaceAll("@module@", module);
    newHtml = newHtml.replaceAll("@theme@", theme);
    newHtml = newHtml.replaceAll("@chapter@", chapter);
    newHtml = newHtml.replaceAll("@question@", question);
    newHtml = newHtml.replaceAll("@answer@", answer);
    newHtml = newHtml.replaceAll("@solution@", solution);
    newHtml = newHtml.replaceAll("@year@", now.year.toString());
    return (newHtml);
  }
}
