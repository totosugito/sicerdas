import 'model_chapter.dart';

class ClMmChapter {
  late String userId;
  late String chapterKey;
  late int correct;
  late int wrong;
  late List<bool> modeTypes;
  late List<bool> ranges;
  late String extra;
  late String title;

  ClMmChapter();

  ClMmChapter.create({required this.userId, required this.chapterKey}) {
    _init();
  }

  ClMmChapter.auto({required this.userId, required ModelChapter chapter}) {
    _init();
    chapterKey = chapter.chapterKey;
    title = chapter.title;
    _fillFromChapter(chapter);
  }

  _init() {
    correct = 0;
    wrong = 0;
    modeTypes = [];
    ranges = [];
    extra = "";
    title = "";
  }

  fixDataIfNeeded(ModelChapter chapter) {
    if (modeTypes.length != chapter.types.length) {
      _fillFromChapter(chapter);
    }
    if (ranges.length != chapter.ranges.length) {
      _fillFromChapter(chapter);
    }
  }

  _fillFromChapter(ModelChapter chapter) {
    int lenType = chapter.types.length;
    if (lenType > 0) {
      modeTypes = List<bool>.filled(lenType, false);
      modeTypes[0] = true;
    } else {
      modeTypes = [];
    }

    int lenRange = chapter.ranges.length;
    if (lenRange > 0) {
      ranges = List<bool>.filled(lenRange, false);
      ranges[0] = true;
    } else {
      ranges = [];
    }
  }
}
