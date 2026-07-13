import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../solver/libs/html_lib.dart';
import '../../models/enums.dart';
import '../../models/model_chapter.dart';
import '../../models/chapter_range.dart';
import '../../models/model_number.dart';

class ChapterDivision {
  static List<ModelChapter> create(BuildContext context) {
    final locale = Translations.of(context).math_master;
    var topic = KeyTopic.topicDivision;
    var baseTopicIndex = topic.index * 100;
    List<ModelChapter> list = [
      ModelChapter(
        grade: KeyGrade.gradeThree,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.divisionSequential.name,
        topicLabel: locale.topics_division,
        title: locale.chapter_division_sequential,
        cover: "4 : 2",
        sort: baseTopicIndex + 3,
        ranges: [
          ChapterRange(
              id: 0,
              title: sprintf("%s 1", [locale.topics_division]),
              desc: "[1 \\ldots 10] : 1",
              numRanges: [ModelNumber(min: 1, max: 1), ModelNumber(min: 1, max: 10)]),
          ChapterRange(
              id: 1,
              title: sprintf("%s 2", [locale.topics_division]),
              desc: "[1 \\ldots 20] : 2",
              numRanges: [ModelNumber(min: 2, max: 2), ModelNumber(min: 1, max: 10)]),
          ChapterRange(
              id: 2,
              title: sprintf("%s 3", [locale.topics_division]),
              desc: "[1 \\ldots 30] : 3",
              numRanges: [ModelNumber(min: 3, max: 3), ModelNumber(min: 1, max: 10)]),
          ChapterRange(
              id: 3,
              title: sprintf("%s 4", [locale.topics_division]),
              desc: "[1 \\ldots 40] : 4",
              numRanges: [ModelNumber(min: 4, max: 4), ModelNumber(min: 1, max: 10)]),
          ChapterRange(
              id: 4,
              title: sprintf("%s 5", [locale.topics_division]),
              desc: "[1 \\ldots 50] : 5",
              numRanges: [ModelNumber(min: 5, max: 5), ModelNumber(min: 1, max: 10)]),
          ChapterRange(
              id: 5,
              title: sprintf("%s 6", [locale.topics_division]),
              desc: "[1 \\ldots 60] : 6",
              numRanges: [ModelNumber(min: 6, max: 6), ModelNumber(min: 1, max: 10)]),
          ChapterRange(
              id: 6,
              title: sprintf("%s 7", [locale.topics_division]),
              desc: "[1 \\ldots 70] : 7",
              numRanges: [ModelNumber(min: 7, max: 7), ModelNumber(min: 1, max: 10)]),
          ChapterRange(
              id: 7,
              title: sprintf("%s 8", [locale.topics_division]),
              desc: "[1 \\ldots 80] : 8",
              numRanges: [ModelNumber(min: 8, max: 8), ModelNumber(min: 1, max: 10)]),
          ChapterRange(
              id: 8,
              title: sprintf("%s 9", [locale.topics_division]),
              desc: "[1 \\ldots 90] : 9",
              numRanges: [ModelNumber(min: 9, max: 9), ModelNumber(min: 1, max: 10)]),
        ],
      ),
      ModelChapter(
          grade: KeyGrade.gradeFour,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.division2Digit.name,
          topicLabel: locale.topics_division,
          title: locale.chapter_division_2_digits,
          cover: "12 : 6",
          sort: baseTopicIndex + 4,
          ranges: [
            ChapterRange(
                id: 0,
                title: locale.level_easy,
                desc: "[10 \\ldots 50] : [2 \\ldots 9]",
                numRanges: [ModelNumber(min: 10, max: 50), ModelNumber(min: 2, max: 9)]),
            ChapterRange(
                id: 1,
                title: locale.level_medium,
                desc: "[50 \\ldots 99] : [2 \\ldots 9]",
                numRanges: [ModelNumber(min: 50, max: 99), ModelNumber(min: 2, max: 9)]),
            ChapterRange(
                id: 2,
                title: locale.level_hard,
                desc: "[10 \\ldots 200] : [10 \\ldots 20]",
                numRanges: [ModelNumber(min: 10, max: 200), ModelNumber(min: 10, max: 20)]),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeFive,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.division3Digit.name,
          topicLabel: locale.topics_division,
          title: locale.chapter_division_3_digits,
          cover: "620 : 20",
          sort: baseTopicIndex + 5,
          ranges: [
            ChapterRange(
                id: 0,
                title: locale.level_easy,
                desc: "[100 \\ldots 200] : [2 \\ldots 9]",
                numRanges: [ModelNumber(min: 100, max: 200), ModelNumber(min: 2, max: 9)]),
            ChapterRange(
                id: 1,
                title: locale.level_medium,
                desc: "[200 \\ldots 500] : [2 \\ldots 9]",
                numRanges: [ModelNumber(min: 200, max: 500), ModelNumber(min: 2, max: 9)]),
            ChapterRange(
                id: 2,
                title: locale.level_hard,
                desc: "[100 \\ldots 200] : [10 \\ldots 50]",
                numRanges: [ModelNumber(min: 100, max: 200), ModelNumber(min: 10, max: 50)]),
            ChapterRange(
                id: 3,
                title: locale.level_expert,
                desc: "[200 \\ldots 500] : [10 \\ldots 50]",
                numRanges: [ModelNumber(min: 200, max: 500), ModelNumber(min: 10, max: 50)]),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeFive,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.divisionSimple.name,
          topicLabel: locale.topics_division,
          title: locale.chapter_division_simple,
          cover: "100 : 10",
          sort: baseTopicIndex + 6,
          ranges: [
            ChapterRange(
                id: 0,
                title: locale.level_easy,
                desc: "2\\text{ Digit} : [10, 20, \\ldots 50]",
                numRanges: [ModelNumber(min: 10, max: 99), ModelNumber(min: 10, spacing: 10, max: 50)]),
            ChapterRange(
                id: 1,
                title: locale.level_medium,
                desc: "3\\text{ Digit} : [50, 100, \\ldots 500]",
                numRanges: [ModelNumber(min: 100, max: 999), ModelNumber(min: 50, spacing: 50, max: 500)]),
            ChapterRange(
                id: 2,
                title: locale.level_hard,
                desc: "4\\text{ Digit} : [100, 200, \\ldots 500]",
                numRanges: [ModelNumber(min: 1000, max: 5000), ModelNumber(min: 100, spacing: 100, max: 500)]),
          ]),
    ];
    return list;
  }
}
