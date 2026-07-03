import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_chapter.dart';
import '../../models/chapter_range.dart';
import '../../models/model_number.dart';

class ChapterAddition {
  static List<ModelChapter> create(BuildContext context) {
    final locale = Translations.of(context).math_master;
    var topic = KeyTopic.topicAddition;
    var baseTopicIndex = topic.index * 100;

    return [
      ModelChapter(
        grade: KeyGrade.gradeOne,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.additionSequential.name,
        topicLabel: locale.topics_addition,
        title: locale.chapter_addition_sequential,
        cover: "1 + 2",
        sort: baseTopicIndex + 3,
        ranges: [
          ChapterRange(
              id: 0,
              title: "${locale.topics_addition} 1",
              desc: "1 + [1 \\ldots 9]",
              numRanges: [ModelNumber(min: 1, max: 1), ModelNumber(min: 1, max: 9)]),
          ChapterRange(
              id: 1,
              title: "${locale.topics_addition} 2",
              desc: "2 + [1 \\ldots 9]",
              numRanges: [ModelNumber(min: 2, max: 2), ModelNumber(min: 1, max: 9)]),
          ChapterRange(
              id: 2,
              title: "${locale.topics_addition} 3",
              desc: "3 + [1 \\ldots 9]",
              numRanges: [ModelNumber(min: 3, max: 3), ModelNumber(min: 1, max: 9)]),
          ChapterRange(
              id: 3,
              title: "${locale.topics_addition} 4",
              desc: "4 + [1 \\ldots 9]",
              numRanges: [ModelNumber(min: 4, max: 4), ModelNumber(min: 1, max: 9)]),
          ChapterRange(
              id: 4,
              title: "${locale.topics_addition} 5",
              desc: "5 + [1 \\ldots 9]",
              numRanges: [ModelNumber(min: 5, max: 5), ModelNumber(min: 1, max: 9)]),
          ChapterRange(
              id: 5,
              title: "${locale.topics_addition} 6",
              desc: "6 + [1 \\ldots 9]",
              numRanges: [ModelNumber(min: 6, max: 6), ModelNumber(min: 1, max: 9)]),
          ChapterRange(
              id: 6,
              title: "${locale.topics_addition} 7",
              desc: "7 + [1 \\ldots 9]",
              numRanges: [ModelNumber(min: 7, max: 7), ModelNumber(min: 1, max: 9)]),
          ChapterRange(
              id: 7,
              title: "${locale.topics_addition} 8",
              desc: "8 + [1 \\ldots 9]",
              numRanges: [ModelNumber(min: 8, max: 8), ModelNumber(min: 1, max: 9)]),
          ChapterRange(
              id: 8,
              title: "${locale.topics_addition} 9",
              desc: "9 + [1 \\ldots 9]",
              numRanges: [ModelNumber(min: 9, max: 9), ModelNumber(min: 1, max: 9)]),
        ],
      ),
      ModelChapter(
          grade: KeyGrade.gradeTwo,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.addition2Digit.name,
          topicLabel: locale.topics_addition,
          title: locale.chapter_addition_2_digits,
          cover: "12 + 34",
          sort: baseTopicIndex + 4,
          ranges: [
            ChapterRange(
                id: 0,
                title: locale.level_easy,
                desc: "[10 \\ldots 20] + [1 \\ldots 9]",
                numRanges: [ModelNumber(min: 10, max: 20), ModelNumber(min: 1, max: 9)]),
            ChapterRange(
                id: 1,
                title: locale.level_medium,
                desc: "[20 \\ldots 50] + [1 \\ldots 9]",
                numRanges: [ModelNumber(min: 20, max: 50), ModelNumber(min: 1, max: 9)]),
            ChapterRange(
                id: 2,
                title: locale.level_hard,
                desc: "[10 \\ldots 20] + [10 \\ldots 20]",
                numRanges: [ModelNumber(min: 10, max: 20), ModelNumber(min: 10, max: 20)]),
            ChapterRange(
                id: 3,
                title: locale.level_expert,
                desc: "[20 \\ldots 50] + [10 \\ldots 50]",
                numRanges: [ModelNumber(min: 20, max: 50), ModelNumber(min: 10, max: 50)]),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeThree,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.addition3Digit.name,
          topicLabel: locale.topics_addition,
          title: locale.chapter_addition_3_digits,
          cover: "123 + 456",
          sort: baseTopicIndex + 5,
          ranges: [
            ChapterRange(
                id: 0,
                title: "3 Digit + 1 Digit",
                desc: "[100 \\ldots 200] + [1 \\ldots 9]",
                numRanges: [ModelNumber(min: 100, max: 200), ModelNumber(min: 1, max: 9)]),
            ChapterRange(
                id: 1,
                title: "3 Digit + 1 Digit ★",
                desc: "[200 \\ldots 500] + [1 \\ldots 9]",
                numRanges: [ModelNumber(min: 200, max: 500), ModelNumber(min: 1, max: 9)]),
            ChapterRange(
                id: 2,
                title: "3 Digit + 2 Digit",
                desc: "[100 \\ldots 200] + [10 \\ldots 50]",
                numRanges: [ModelNumber(min: 100, max: 200), ModelNumber(min: 10, max: 50)]),
            ChapterRange(
                id: 3,
                title: "3 Digit + 2 Digit ★",
                desc: "[200 \\ldots 500] + [10 \\ldots 99]",
                numRanges: [ModelNumber(min: 200, max: 500), ModelNumber(min: 10, max: 99)]),
            ChapterRange(
                id: 4,
                title: "3 Digit + 3 Digit",
                desc: "[100 \\ldots 200] + [100 \\ldots 200]",
                numRanges: [ModelNumber(min: 100, max: 200), ModelNumber(min: 100, max: 200)]),
            ChapterRange(
                id: 5,
                title: "3 Digit + 3 Digit ★",
                desc: "[200 \\ldots 500] + [100 \\ldots 500]",
                numRanges: [ModelNumber(min: 200, max: 500), ModelNumber(min: 100, max: 500)]),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeFive,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.addition4Digit.name,
          topicLabel: locale.topics_addition,
          title: locale.chapter_addition_4_digits,
          cover: "1234 + 4567",
          sort: baseTopicIndex + 7,
          ranges: [
            ChapterRange(
                id: 0,
                title: "4 Digit + 1 Digit",
                desc: "[1000 \\ldots 2000] + [1 \\ldots 9]",
                numRanges: [ModelNumber(min: 1000, max: 2000), ModelNumber(min: 1, max: 9)]),
            ChapterRange(
                id: 1,
                title: "4 Digit + 1 Digit ★",
                desc: "[2000 \\ldots 5000] + [1 \\ldots 9]",
                numRanges: [ModelNumber(min: 2000, max: 5000), ModelNumber(min: 1, max: 9)]),
            ChapterRange(
                id: 2,
                title: "4 Digit + 2 Digit",
                desc: "[1000 \\ldots 2000] + [10 \\ldots 20]",
                numRanges: [ModelNumber(min: 1000, max: 2000), ModelNumber(min: 10, max: 20)]),
            ChapterRange(
                id: 3,
                title: "4 Digit + 2 Digit ★",
                desc: "[2000 \\ldots 5000] + [10 \\ldots 99]",
                numRanges: [ModelNumber(min: 2000, max: 5000), ModelNumber(min: 10, max: 99)]),
            ChapterRange(
                id: 4,
                title: "4 Digit + 3 Digit",
                desc: "[1000 \\ldots 2000] + [100 \\ldots 200]",
                numRanges: [ModelNumber(min: 1000, max: 2000), ModelNumber(min: 100, max: 200)]),
            ChapterRange(
                id: 5,
                title: "4 Digit + 3 Digit ★",
                desc: "[2000 \\ldots 5000] + [100 \\ldots 500]",
                numRanges: [ModelNumber(min: 2000, max: 5000), ModelNumber(min: 100, max: 500)]),
            ChapterRange(
                id: 6,
                title: "4 Digit + 4 Digit",
                desc: "[1000 \\ldots 2000] + [1000 \\ldots 2000]",
                numRanges: [ModelNumber(min: 1000, max: 2000), ModelNumber(min: 1000, max: 2000)]),
            ChapterRange(
                id: 7,
                title: "4 Digit + 4 Digit ★",
                desc: "[2000 \\ldots 5000] + [1000 \\ldots 5000]",
                numRanges: [ModelNumber(min: 2000, max: 5000), ModelNumber(min: 1000, max: 5000)]),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeSix,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.additionNegative.name,
          topicLabel: locale.topics_addition,
          title: locale.chapter_addition_negative,
          cover: "4 + (-3)",
          sort: baseTopicIndex + 9,
          ranges: [
            ChapterRange(
                id: 0,
                title: locale.level_breezy,
                desc: "[1 \\ldots 9] + ([-9 \\ldots -1])",
                numRanges: [
                  ModelNumber(min: 1, max: 9),
                  ModelNumber(min: -9, max: -1)
                ]),
            ChapterRange(
                id: 1,
                title: locale.level_easy,
                desc: "[-9 \\ldots 9]) + [-9 \\ldots 9]",
                numRanges: [
                  ModelNumber(min: -9, max: 9),
                  ModelNumber(min: -9, max: 9)
                ]),
            ChapterRange(
                id: 2,
                title: locale.level_medium,
                desc: "[10 \\ldots 20] + ([-9 \\ldots -1])",
                numRanges: [
                  ModelNumber(min: 10, max: 20),
                  ModelNumber(min: -9, max: -1)
                ]),
            ChapterRange(
                id: 3,
                title: locale.level_hard,
                desc: "[-20 \\ldots 20]) + [-20 \\ldots 20]",
                numRanges: [
                  ModelNumber(min: -20, max: 20),
                  ModelNumber(min: -20, max: 20)
                ]),
            ChapterRange(
                id: 4,
                title: locale.level_expert,
                desc: "[-30 \\ldots 30] + [-30 \\ldots 30])",
                numRanges: [
                  ModelNumber(min: -30, max: 30),
                  ModelNumber(min: -30, max: 30)
                ]),
          ]),
      ModelChapter(
        grade: KeyGrade.gradeThree,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.additionMissingDigit.name,
        topicLabel: locale.topics_addition,
        title: locale.chapter_addition_missing_digit,
        cover: "1 + \\square = 3",
        sort: baseTopicIndex + 10,
        ranges: [
          ChapterRange(
              id: 0,
              title: locale.level_easy,
              desc: "[1 \\ldots 9] + [1 \\ldots 9]",
              numRanges: [ModelNumber(min: 1, max: 9), ModelNumber(min: 1, max: 9)]),
          ChapterRange(
              id: 1,
              title: locale.level_medium,
              desc: "[10 \\ldots 20] + [1 \\ldots 9]",
              numRanges: [ModelNumber(min: 10, max: 20), ModelNumber(min: 1, max: 9)]),
          ChapterRange(
              id: 2,
              title: locale.level_hard,
              desc: "[20 \\ldots 30] + [10 \\ldots 30]",
              numRanges: [ModelNumber(min: 20, max: 30), ModelNumber(min: 10, max: 30)]),
          ChapterRange(
              id: 3,
              title: locale.level_expert,
              desc: "[30 \\ldots 50] + [10 \\ldots 50]",
              numRanges: [ModelNumber(min: 30, max: 50), ModelNumber(min: 10, max: 50)]),
        ],
        pads: const [KeyPadMode.pad4Pad, KeyPadMode.padNumPad],
      ),
      ModelChapter(
          grade: KeyGrade.gradeFour,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.additionSimple.name,
          topicLabel: locale.topics_addition,
          title: locale.chapter_addition_simple,
          cover: "10 + 20",
          sort: baseTopicIndex + 8,
          ranges: [
            ChapterRange(
                id: 0,
                title: locale.level_breezy,
                desc: "[10, 20, \\ldots 90]",
                numRanges: [ModelNumber(min: 10, spacing: 10, max: 50), ModelNumber(min: 10, spacing: 10, max: 50)]),
            ChapterRange(
                id: 1,
                title: locale.level_easy,
                desc: "[5, 10, 15, \\ldots 90]",
                numRanges: [ModelNumber(min: 5, spacing: 5, max: 90), ModelNumber(min: 5, spacing: 5, max: 90)]),
            ChapterRange(
                id: 2,
                title: locale.level_medium,
                desc: "[100, 200, \\ldots, 900]",
                numRanges: [ModelNumber(min: 100, spacing: 100, max: 900), ModelNumber(min: 100, spacing: 100, max: 900)]),
            ChapterRange(
                id: 3,
                title: locale.level_hard,
                desc: "[50, 100, 150, \\ldots, 900]",
                numRanges: [ModelNumber(min: 50, spacing: 50, max: 900), ModelNumber(min: 50, spacing: 50, max: 900)]),
          ]),
    ];
  }
}
