import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_chapter.dart';
import '../../models/chapter_range.dart';
import '../../models/model_number.dart';

class ChapterMultiplication {
  static List<ModelChapter> create(BuildContext context) {
    final locale = Translations.of(context).math_master;
    var topic = KeyTopic.topicMultiplication;
    var baseTopicIndex = topic.index * 100;
    List<ModelChapter> list = [
      ModelChapter(
        grade: KeyGrade.gradeThree,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.multiplicationSequential.name,
        topicLabel: locale.topics_multiplication,
        title: locale.chapter_multiplication_sequential,
        cover: "1 \\times 2",
        sort: baseTopicIndex + 3,
        ranges: [
          ChapterRange(
            id: 0,
            title: "${locale.topics_multiplication} 1",
            desc: "1 \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 1, max: 1),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 1,
            title: "${locale.topics_multiplication} 2",
            desc: "2 \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 2, max: 2),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 2,
            title: "${locale.topics_multiplication} 3",
            desc: "3 \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 3, max: 3),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 3,
            title: "${locale.topics_multiplication} 4",
            desc: "4 \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 4, max: 4),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 4,
            title: "${locale.topics_multiplication} 5",
            desc: "5 \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 5, max: 5),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 5,
            title: "${locale.topics_multiplication} 6",
            desc: "6 \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 6, max: 6),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 6,
            title: "${locale.topics_multiplication} 7",
            desc: "7 \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 7, max: 7),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 7,
            title: "${locale.topics_multiplication} 8",
            desc: "8 \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 8, max: 8),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 8,
            title: "${locale.topics_multiplication} 9",
            desc: "9 \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 9, max: 9),
              ModelNumber(min: 1, max: 9),
            ],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeFour,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.multiplication2Digit.name,
        topicLabel: locale.topics_multiplication,
        title: locale.chapter_multiplication_2_digits,
        cover: "12 \\times 34",
        sort: baseTopicIndex + 4,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_easy,
            desc: "[10 \\ldots 20] \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 10, max: 20),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_medium,
            desc: "[20 \\ldots 50] \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 20, max: 50),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_hard,
            desc: "[10 \\ldots 20] \\times [10 \\ldots 20]",
            numRanges: [
              ModelNumber(min: 10, max: 20),
              ModelNumber(min: 10, max: 20),
            ],
          ),
          ChapterRange(
            id: 3,
            title: locale.level_expert,
            desc: "[20 \\ldots 50] \\times [10 \\ldots 50]",
            numRanges: [
              ModelNumber(min: 20, max: 50),
              ModelNumber(min: 10, max: 50),
            ],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeFive,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.multiplication3Digit.name,
        topicLabel: locale.topics_multiplication,
        title: locale.chapter_multiplication_3_digits,
        cover: "123 \\times 456",
        sort: baseTopicIndex + 5,
        ranges: [
          ChapterRange(
            id: 0,
            title: "3 Digit × 1 Digit",
            desc: "[100 \\ldots 200] \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 100, max: 200),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 1,
            title: "3 Digit × 1 Digit ★",
            desc: "[200 \\ldots 500] \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 200, max: 500),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 2,
            title: "3 Digit × 2 Digit",
            desc: "[100 \\ldots 200] \\times [10 \\ldots 50]",
            numRanges: [
              ModelNumber(min: 100, max: 200),
              ModelNumber(min: 10, max: 50),
            ],
          ),
          ChapterRange(
            id: 3,
            title: "3 Digit × 2 Digit ★",
            desc: "[200 \\ldots 500] \\times [10 \\ldots 99]",
            numRanges: [
              ModelNumber(min: 200, max: 500),
              ModelNumber(min: 10, max: 99),
            ],
          ),
          ChapterRange(
            id: 4,
            title: "3 Digit × 3 Digit",
            desc: "[100 \\ldots 200] \\times [100 \\ldots 200]",
            numRanges: [
              ModelNumber(min: 100, max: 200),
              ModelNumber(min: 100, max: 200),
            ],
          ),
          ChapterRange(
            id: 5,
            title: "3 Digit × 3 Digit ★",
            desc: "[200 \\ldots 500] \\times [100 \\ldots 500]",
            numRanges: [
              ModelNumber(min: 200, max: 500),
              ModelNumber(min: 100, max: 500),
            ],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeSix,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.multiplicationNegative.name,
        topicLabel: locale.topics_multiplication,
        title: locale.chapter_multiplication_negative,
        cover: "4 \\times (-3)",
        sort: baseTopicIndex + 9,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_breezy,
            desc: "[1 \\ldots 9] \\times [-3 \\ldots -1]",
            numRanges: [
              ModelNumber(min: 1, max: 9),
              ModelNumber(min: -3, max: -1),
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_easy,
            desc: "[-9 \\ldots 9] \\times [-9 \\ldots -1]",
            numRanges: [
              ModelNumber(min: -9, max: 9),
              ModelNumber(min: -9, max: -1),
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_medium,
            desc: "[10 \\ldots 10] \\times [-5 \\ldots 5]",
            numRanges: [
              ModelNumber(min: 1, max: 10),
              ModelNumber(min: -5, max: 5),
            ],
          ),
          ChapterRange(
            id: 3,
            title: locale.level_hard,
            desc: "[-9 \\ldots 9] \\times [-9 \\ldots 9]",
            numRanges: [
              ModelNumber(min: -9, max: 9),
              ModelNumber(min: -9, max: 9),
            ],
          ),
          ChapterRange(
            id: 4,
            title: locale.level_expert,
            desc: "[-20 \\ldots 20] \\times [-20 \\ldots 20]",
            numRanges: [
              ModelNumber(min: -20, max: 20),
              ModelNumber(min: -20, max: 20),
            ],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeFour,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.multiplicationSimple.name,
        topicLabel: locale.topics_multiplication,
        title: locale.chapter_multiplication_simple,
        cover: "10 \\times 20",
        sort: baseTopicIndex + 8,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_easy,
            desc: "[10, 20, \\ldots 50] \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 10, spacing: 10, max: 50),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_medium,
            desc: "[50, 60, \\ldots 90] \\times [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 50, spacing: 10, max: 90),
              ModelNumber(min: 1, max: 9),
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_hard,
            desc: "[10, 20, \\ldots 50] \\times [10, 20, \\ldots 50]",
            numRanges: [
              ModelNumber(min: 10, spacing: 10, max: 50),
              ModelNumber(min: 10, spacing: 10, max: 50),
            ],
          ),
          ChapterRange(
            id: 3,
            title: locale.level_expert,
            desc: "[50, 60, \\ldots 90] \\times [10, 20, \\ldots 50]",
            numRanges: [
              ModelNumber(min: 50, spacing: 10, max: 90),
              ModelNumber(min: 10, spacing: 10, max: 90),
            ],
          ),
        ],
      ),
    ];
    return list;
  }
}
