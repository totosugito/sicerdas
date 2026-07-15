import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';

import '../../models/enums.dart';
import '../../models/model_chapter.dart';
import '../../models/chapter_range.dart';
import '../../models/model_number.dart';

class ChapterLength {
  static List<ModelChapter> create(BuildContext context) {
    final locale = Translations.of(context).math_master;
    var topic = KeyTopic.topicLength;
    var baseTopicIndex = topic.index * 100;
    List<ModelChapter> list = [
      ModelChapter(
        grade: KeyGrade.gradeThree,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.lengthConversion.name,
        topicLabel: locale.topics_length,
        title: locale.chapter_length_conversion,
        cover: "5\\text{ m} = \\ldots\\text{ dm}",
        sort: baseTopicIndex + 4,
        ranges: [
          // [range, multiplier, unit spacing]
          ChapterRange(
            id: 0,
            title: locale.level_breezy,
            numRanges: [
              ModelNumber(min: 1, max: 9),
              ModelNumber(min: 0, max: 0),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_easy,
            numRanges: [
              ModelNumber(min: 1, max: 20),
              ModelNumber(min: 0, max: 0),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_medium,
            numRanges: [
              ModelNumber(min: 10, max: 30),
              ModelNumber(min: 1, max: 1),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 3,
            title: locale.level_hard,
            numRanges: [
              ModelNumber(min: 30, max: 60),
              ModelNumber(min: 2, max: 2),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 4,
            title: locale.level_expert,
            numRanges: [
              ModelNumber(min: 50, max: 80),
              ModelNumber(min: 1, max: 2),
              ModelNumber(min: 1, max: 1),
            ],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeThree,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.lengthAddition.name,
        topicLabel: locale.topics_length,
        title: locale.chapter_length_addition,
        cover: "5\\text{ m} + 4\\text{ cm}",
        sort: baseTopicIndex + 5,
        ranges: [
          // [range, multiplier, unit spacing]
          ChapterRange(
            id: 0,
            title: locale.level_breezy,
            numRanges: [
              ModelNumber(min: 1, max: 9),
              ModelNumber(min: 0, max: 0),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_easy,
            numRanges: [
              ModelNumber(min: 1, max: 20),
              ModelNumber(min: 0, max: 0),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_medium,
            numRanges: [
              ModelNumber(min: 10, max: 30),
              ModelNumber(min: 1, max: 1),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 3,
            title: locale.level_hard,
            numRanges: [
              ModelNumber(min: 30, max: 60),
              ModelNumber(min: 2, max: 2),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 4,
            title: locale.level_expert,
            numRanges: [
              ModelNumber(min: 50, max: 80),
              ModelNumber(min: 1, max: 2),
              ModelNumber(min: 1, max: 1),
            ],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeThree,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.lengthSubtraction.name,
        topicLabel: locale.topics_length,
        title: locale.chapter_length_subtraction,
        cover: "5\\text{ m} - 4\\text{ cm}",
        sort: baseTopicIndex + 6,
        ranges: [
          // [range, multiplier, unit spacing]
          ChapterRange(
            id: 0,
            title: locale.level_breezy,
            numRanges: [
              ModelNumber(min: 1, max: 9),
              ModelNumber(min: 0, max: 0),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_easy,
            numRanges: [
              ModelNumber(min: 1, max: 20),
              ModelNumber(min: 0, max: 0),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_medium,
            numRanges: [
              ModelNumber(min: 10, max: 30),
              ModelNumber(min: 1, max: 1),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 3,
            title: locale.level_hard,
            numRanges: [
              ModelNumber(min: 30, max: 60),
              ModelNumber(min: 2, max: 2),
              ModelNumber(min: 1, max: 1),
            ],
          ),
          ChapterRange(
            id: 4,
            title: locale.level_expert,
            numRanges: [
              ModelNumber(min: 50, max: 80),
              ModelNumber(min: 1, max: 2),
              ModelNumber(min: 1, max: 1),
            ],
          ),
        ],
      ),
    ];
    return (list);
  }
}
