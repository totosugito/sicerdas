import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'models/enums.dart';
import 'models/model_chapter.dart';
import 'models/chapter_range.dart';
import 'models/model_number.dart';
import 'models/model_item.dart';
import 'models/achievement_parent.dart';

class DataMathMaster {
  static _addChapter(List<ModelChapter> totalList, List<ModelChapter> list) {
    for (var item in list) {
      totalList.add(item);
    }
  }

  static Map<KeyTopic, List<ModelChapter>> createGroupByGrades(List<ModelChapter> list, KeyGrade grade) {
    List<ModelChapter> result = list;
    result = result.where((item) => item.grade == grade).toList(); // filter by grade
    result.sort((a, b) => a.sort.compareTo(b.sort)); // sort by sort
    Map<KeyTopic, List<ModelChapter>> groups = groupBy(result, (ModelChapter e) {
      return e.topic;
    });

    return (groups);
  }

  static Map<KeyTopic, List<ModelChapter>> createGroupByTopics(List<ModelChapter> list, KeyTopic topic) {
    List<ModelChapter> result = list;
    result = result.where((item) => item.topic == topic).toList(); // filter by topic
    result.sort((a, b) => a.sort.compareTo(b.sort)); // sort by topic
    Map<KeyTopic, List<ModelChapter>> groups = groupBy(result, (ModelChapter e) {
      return e.topic;
    });

    return (groups);
  }

  static List<ModelItem> createGroupList(BuildContext context) {
    List<ModelItem> list = [
      ModelItem(id: KeyGroup.grades.index, key: KeyGroup.grades.name, title: 'Berdasarkan Kelas', assets: 'grades'),
      ModelItem(id: KeyGroup.topics.index, key: KeyGroup.topics.name, title: 'Berdasarkan Topik', assets: 'topics')
    ];
    return list;
  }

  static List<ModelItem> createGradesList(BuildContext context) {
    List<ModelItem> list = [
      ModelItem(id: KeyGrade.gradeOne.index, key: KeyGrade.gradeOne.name, title: 'Kelas 1', assets: 'grade_1'),
      ModelItem(id: KeyGrade.gradeTwo.index, key: KeyGrade.gradeTwo.name, title: 'Kelas 2', assets: 'grade_2'),
      ModelItem(id: KeyGrade.gradeThree.index, key: KeyGrade.gradeThree.name, title: 'Kelas 3', assets: 'grade_3'),
      ModelItem(id: KeyGrade.gradeFour.index, key: KeyGrade.gradeFour.name, title: 'Kelas 4', assets: 'grade_4'),
      ModelItem(id: KeyGrade.gradeFive.index, key: KeyGrade.gradeFive.name, title: 'Kelas 5', assets: 'grade_5'),
      ModelItem(id: KeyGrade.gradeSix.index, key: KeyGrade.gradeSix.name, title: 'Kelas 6', assets: 'grade_6'),
    ];
    return list;
  }

  static List<ModelItem> createTopicsList(BuildContext context) {
    List<ModelItem> list = [
      ModelItem(id: KeyTopic.topicAddition.index, key: KeyTopic.topicAddition.name, title: 'Penjumlahan', assets: 'addition'),
    ];
    list.sort((a, b) => a.id.compareTo(b.id)); // sort by topic
    return list;
  }

  static List<AchievementParent> createAchievementList(BuildContext context, List<ModelChapter> chapters) {
    List<AchievementParent> list = [];

    List<ModelItem> topics = createTopicsList(context);
    for (ModelItem topic in topics) {
      AchievementParent achievement = AchievementParent.fromTopic(topic);
      List<ModelChapter> achievementChild = chapters.where((item) => item.topic.index == topic.id).toList();
      if (achievementChild.isNotEmpty) {
        achievement.child = achievementChild;
        list.add(achievement);
      }
    }
    return (list);
  }

  static List<ModelChapter> createChapterList(BuildContext context) {
    List<ModelChapter> list = [];
    
    // For Phase 0.4 Proof of Concept, we only register the Addition 1-Digit chapter
    var topic = KeyTopic.topicAddition;
    var baseTopicIndex = topic.index * 100;
    
    list.add(ModelChapter(
      grade: KeyGrade.gradeOne,
      topic: topic,
      hasSolution: true,
      chapterKey: KeyChapter.addition1Digit.name,
      topicLabel: 'Penjumlahan',
      title: 'Penjumlahan 1 Digit',
      cover: '1 + 2',
      sort: baseTopicIndex + 1,
      ranges: [
        ChapterRange(
          id: 0,
          title: 'Penjumlahan 1 Digit',
          desc: '[1 ... 9] + [1 ... 9]',
          numRanges: [ModelNumber(min: 1, max: 9), ModelNumber(min: 1, max: 9)]
        )
      ]
    ));
    
    return list;
  }
}
