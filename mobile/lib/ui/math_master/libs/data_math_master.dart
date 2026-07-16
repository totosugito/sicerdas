import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import 'models/enums.dart';
import 'models/model_chapter.dart';
import 'models/model_item.dart';
import 'models/achievement_parent.dart';
import 'modules/addition/chapter_addition.dart';
import 'modules/clock/chapter_clock.dart';
import 'modules/division/chapter_division.dart';
import 'modules/factorization/chapter_factorization.dart';
import 'modules/fractions/chapter_fractions.dart';
import 'modules/length/chapter_length.dart';
import 'modules/weight/chapter_weight.dart';
import 'modules/roman/chapter_roman.dart';
import 'modules/percents/chapter_percents.dart';
import 'modules/multiplication/chapter_multiplication.dart';

class DataMathMaster {
  static void _addChapter(
    List<ModelChapter> totalList,
    List<ModelChapter> list,
  ) {
    for (var item in list) {
      totalList.add(item);
    }
  }

  static Map<KeyTopic, List<ModelChapter>> createGroupByGrades(
    List<ModelChapter> list,
    KeyGrade grade,
  ) {
    List<ModelChapter> result = list;
    result = result
        .where((item) => item.grade == grade)
        .toList(); // filter by grade
    result.sort((a, b) => a.sort.compareTo(b.sort)); // sort by sort
    Map<KeyTopic, List<ModelChapter>> groups = groupBy(result, (
      ModelChapter e,
    ) {
      return e.topic;
    });

    return (groups);
  }

  static Map<KeyTopic, List<ModelChapter>> createGroupByTopics(
    List<ModelChapter> list,
    KeyTopic topic,
  ) {
    List<ModelChapter> result = list;
    result = result
        .where((item) => item.topic == topic)
        .toList(); // filter by topic
    result.sort((a, b) => a.sort.compareTo(b.sort)); // sort by topic
    Map<KeyTopic, List<ModelChapter>> groups = groupBy(result, (
      ModelChapter e,
    ) {
      return e.topic;
    });

    return (groups);
  }

  static List<ModelItem> createGroupList(BuildContext context) {
    final locale = Translations.of(context).math_master;
    List<ModelItem> list = [
      ModelItem(
        id: KeyGroup.grades.index,
        key: KeyGroup.grades.name,
        title: locale.group_grades,
        assets: 'grades',
      ),
      ModelItem(
        id: KeyGroup.topics.index,
        key: KeyGroup.topics.name,
        title: locale.group_topics,
        assets: 'topics',
      ),
    ];
    return list;
  }

  static List<ModelItem> createGradesList(BuildContext context) {
    final locale = Translations.of(context).math_master;
    List<ModelItem> list = [
      ModelItem(
        id: KeyGrade.gradeOne.index,
        key: KeyGrade.gradeOne.name,
        title: locale.grades_class_1,
        assets: 'grade_1',
      ),
      ModelItem(
        id: KeyGrade.gradeTwo.index,
        key: KeyGrade.gradeTwo.name,
        title: locale.grades_class_2,
        assets: 'grade_2',
      ),
      ModelItem(
        id: KeyGrade.gradeThree.index,
        key: KeyGrade.gradeThree.name,
        title: locale.grades_class_3,
        assets: 'grade_3',
      ),
      ModelItem(
        id: KeyGrade.gradeFour.index,
        key: KeyGrade.gradeFour.name,
        title: locale.grades_class_4,
        assets: 'grade_4',
      ),
      ModelItem(
        id: KeyGrade.gradeFive.index,
        key: KeyGrade.gradeFive.name,
        title: locale.grades_class_5,
        assets: 'grade_5',
      ),
      ModelItem(
        id: KeyGrade.gradeSix.index,
        key: KeyGrade.gradeSix.name,
        title: locale.grades_class_6,
        assets: 'grade_6',
      ),
    ];
    return list;
  }

  static List<ModelItem> createTopicsList(BuildContext context) {
    final locale = Translations.of(context).math_master;
    List<ModelItem> list = [
      ModelItem(
        id: KeyTopic.topicAddition.index,
        key: KeyTopic.topicAddition.name,
        title: locale.topics_addition,
        assets: 'addition',
      ),
      ModelItem(
        id: KeyTopic.topicMultiplication.index,
        key: KeyTopic.topicMultiplication.name,
        title: locale.topics_multiplication,
        assets: 'multiplication',
      ),
      ModelItem(
        id: KeyTopic.topicClock.index,
        key: KeyTopic.topicClock.name,
        title: locale.topics_clock,
        assets: 'clock',
      ),
      ModelItem(
        id: KeyTopic.topicDivision.index,
        key: KeyTopic.topicDivision.name,
        title: locale.topics_division,
        assets: 'division',
      ),
      ModelItem(
        id: KeyTopic.topicPrimeFactorization.index,
        key: KeyTopic.topicPrimeFactorization.name,
        title: locale.topics_factorization,
        assets: 'factorization',
      ),
      ModelItem(
        id: KeyTopic.topicFractions.index,
        key: KeyTopic.topicFractions.name,
        title: locale.topics_fractions,
        assets: 'fractions',
      ),
      ModelItem(
        id: KeyTopic.topicLength.index,
        key: KeyTopic.topicLength.name,
        title: locale.topics_length,
        assets: 'length',
      ),
      ModelItem(
        id: KeyTopic.topicWeight.index,
        key: KeyTopic.topicWeight.name,
        title: locale.topics_weight,
        assets: 'weight',
      ),
      ModelItem(
        id: KeyTopic.topicRoman.index,
        key: KeyTopic.topicRoman.name,
        title: locale.topics_roman,
        assets: 'roman',
      ),
      ModelItem(
        id: KeyTopic.topicPercents.index,
        key: KeyTopic.topicPercents.name,
        title: locale.topics_percents,
        assets: 'percents',
      ),
    ];
    list.sort((a, b) => a.id.compareTo(b.id)); // sort by topic
    return list;
  }

  static List<AchievementParent> createAchievementList(
    BuildContext context,
    List<ModelChapter> chapters,
  ) {
    List<AchievementParent> list = [];

    List<ModelItem> topics = createTopicsList(context);
    for (ModelItem topic in topics) {
      AchievementParent achievement = AchievementParent.fromTopic(topic);
      List<ModelChapter> achievementChild = chapters
          .where((item) => item.topic.index == topic.id)
          .toList();
      if (achievementChild.isNotEmpty) {
        achievement.child = achievementChild;
        list.add(achievement);
      }
    }
    return (list);
  }

  static List<ModelChapter> createChapterList(BuildContext context) {
    List<ModelChapter> list = [];
    _addChapter(list, ChapterAddition.create(context));
    _addChapter(list, ChapterClock.create(context));
    _addChapter(list, ChapterDivision.create(context));
    _addChapter(list, ChapterFactorization.create(context));
    _addChapter(list, ChapterFractions.create(context));
    _addChapter(list, ChapterLength.create(context));
    _addChapter(list, ChapterWeight.create(context));
    _addChapter(list, ChapterRoman.create(context));
    _addChapter(list, ChapterPercents.create(context));
    _addChapter(list, ChapterMultiplication.create(context));
    return list;
  }
}
