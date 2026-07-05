class ModelAchievement {
  final int totalStar = 3;
  final int totalLeague = 1;
  final List scoreRange = [
    [100, 500, 1000],
  ];

  late int star;
  late int league;
  late int score;
  late int maxScore;
  late double percentProgress;
  late bool isLeagueFinish;

  void init() {
    star = 0;
    league = 0;
    score = 0;
    maxScore = 100;
    percentProgress = 0.0;
    isLeagueFinish = false;
  }

  ModelAchievement.create(int curScore) {
    init();
    score = curScore;

    bool getResult = false;
    for (int i = totalLeague - 1; i >= 0; i--) {
      for (int j = totalStar - 1; j >= 0; j--) {
        if (score >= scoreRange[i][j]) {
          league = i + 1;
          star = j + 1;
          maxScore = scoreRange[i][j];
          getResult = true;
          break;
        }
      }
      if (getResult) {
        break;
      }
    }

    if (score >= maxScore) {
      if (league >= totalLeague) {
        if (star >= totalStar) {
          isLeagueFinish = true;
        } else {
          maxScore = scoreRange[league - 1][star];
        }
      } else {
        league = league + 1;
        star = 0;
        maxScore = scoreRange[league - 1][0];
      }
    }

    if (isLeagueFinish) {
      percentProgress = 1.0;
    } else {
      percentProgress = score / maxScore;
    }
  }
}
