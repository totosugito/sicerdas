import 'enums.dart';
import 'chapter_range.dart';
import 'chapter_type.dart';

class ModelChapter {
  late int id;
  late KeyGrade grade; // grade id
  late KeyTopic topic; // topic id
  late String chapterKey; // unique key
  late String title; // chapter title
  late String cover; // chapter image
  late bool useCoverAsset;
  late bool visibility;
  late int sort;
  late int correctAnswer;
  late int wrongAnswer;
  late bool hasSolution;
  late String topicLabel;

  late List<KeyPadMode> pads;
  late List<ChapterType> types; // chapter types (empty when not exist)
  late List<ChapterRange> ranges; // chapter ranges

  ModelChapter({
    this.id = 0,
    required this.grade,
    required this.topic,
    required this.chapterKey,
    required this.title,
    this.cover = "",
    required this.topicLabel,
    this.useCoverAsset = false,
    this.types = const [],
    this.ranges = const [],
    this.pads = const [
      KeyPadMode.padYesNo,
      KeyPadMode.pad4Pad,
      KeyPadMode.padNumPad,
    ],
    this.visibility = true,
    this.sort = 0,
    this.correctAnswer = 0,
    this.wrongAnswer = 0,
    this.hasSolution = false,
  });

  ModelChapter.copyMinimal(ModelChapter m) {
    id = m.id;
    grade = m.grade;
    topic = m.topic;
    chapterKey = m.chapterKey;
    title = m.title;
  }

  String getCover() {
    if (useCoverAsset) {
      return ("assets/images/math_master/chapters/$cover.png");
    } else {
      return (cover);
    }
  }

  void setTopicLabel(String v) {
    topicLabel = v;
  }

  String getTopicLabel() {
    return (topicLabel);
  }
}
