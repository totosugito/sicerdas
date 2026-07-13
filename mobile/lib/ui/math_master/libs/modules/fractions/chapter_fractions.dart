import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_chapter.dart';
import '../../models/chapter_range.dart';
import '../../models/model_number.dart';

class ChapterFractions {
  static List<ModelChapter> create(BuildContext context) {
    final locale = Translations.of(context).math_master;
    var topic = KeyTopic.topicFractions;
    var baseTopicIndex = topic.index * 100;
    List<ModelChapter> list = [
      ModelChapter(
          grade: KeyGrade.gradeFour,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.fractionsSimplestForm.name,
          topicLabel: locale.topics_fractions,
          title: locale.chapter_fractions_simplest_form,
          pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
          cover: "\\frac{2}{4} = \\frac{1}{2}",
          sort: baseTopicIndex + 4,
          ranges: [
            ChapterRange(
              id: 0,
              title: locale.level_breezy,
              numRanges: [ModelNumber(minNum: 1, maxNum: 5, minDen: 2, maxDen: 5), ModelNumber(min: 2, max: 2)],
            ),
            ChapterRange(
              id: 1,
              title: locale.level_easy,
              numRanges: [ModelNumber(minNum: 1, maxNum: 5, minDen: 2, maxDen: 6), ModelNumber(min: 3, max: 3)],
            ),
            ChapterRange(
              id: 2,
              title: locale.level_medium,
              numRanges: [ModelNumber(minNum: 1, maxNum: 5, minDen: 2, maxDen: 7), ModelNumber(min: 4, max: 4)],
            ),
            ChapterRange(
              id: 3,
              title: locale.level_hard,
              numRanges: [ModelNumber(minNum: 1, maxNum: 9, minDen: 2, maxDen: 9), ModelNumber(min: 2, max: 5)],
            ),
            ChapterRange(
              id: 4,
              title: locale.level_expert,
              numRanges: [ModelNumber(minNum: 1, maxNum: 9, minDen: 2, maxDen: 9), ModelNumber(min: 5, max: 9)],
            ),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeFour,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.fractionsFromMixed.name,
          topicLabel: locale.topics_fractions,
          title: locale.chapter_fractions_from_mixed,
          pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
          cover: "1\\frac{1}{2} = \\frac{3}{2}",
          sort: baseTopicIndex + 5,
          ranges: [
            ChapterRange(
              id: 0,
              title: locale.level_breezy,
              numRanges: [ModelNumber(min: 1, max: 5, minNum: 1, maxNum: 5, minDen: 2, maxDen: 5)],
            ),
            ChapterRange(
              id: 1,
              title: locale.level_easy,
              numRanges: [ModelNumber(min: 5, max: 9, minNum: 1, maxNum: 5, minDen: 2, maxDen: 6)],
            ),
            ChapterRange(
              id: 2,
              title: locale.level_medium,
              numRanges: [ModelNumber(min: 2, max: 9, minNum: 1, maxNum: 5, minDen: 2, maxDen: 7)],
            ),
            ChapterRange(
              id: 3,
              title: locale.level_hard,
              numRanges: [ModelNumber(min: 2, max: 9, minNum: 1, maxNum: 9, minDen: 2, maxDen: 9)],
            ),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeFour,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.fractionsToMixed.name,
          topicLabel: locale.topics_fractions,
          title: locale.chapter_fractions_to_mixed,
          pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
          cover: "\\frac{3}{2} = 1\\frac{1}{2}",
          sort: baseTopicIndex + 6,
          ranges: [
            ChapterRange(
              id: 0,
              title: locale.level_breezy,
              numRanges: [ModelNumber(min: 1, max: 5, minNum: 1, maxNum: 5, minDen: 2, maxDen: 5)],
            ),
            ChapterRange(
              id: 1,
              title: locale.level_easy,
              numRanges: [ModelNumber(min: 5, max: 9, minNum: 1, maxNum: 5, minDen: 2, maxDen: 6)],
            ),
            ChapterRange(
              id: 2,
              title: locale.level_medium,
              numRanges: [ModelNumber(min: 2, max: 9, minNum: 1, maxNum: 5, minDen: 2, maxDen: 7)],
            ),
            ChapterRange(
              id: 3,
              title: locale.level_hard,
              numRanges: [ModelNumber(min: 2, max: 9, minNum: 1, maxNum: 9, minDen: 2, maxDen: 9)],
            ),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeFive,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.fractionsAddition.name,
          topicLabel: locale.topics_fractions,
          title: locale.chapter_fractions_addition,
          pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
          cover: "\\frac{1}{2} + \\frac{1}{3}",
          sort: baseTopicIndex + 7,
          ranges: [
            ChapterRange(
              id: 0,
              title: locale.level_easy,
              numRanges: [ModelNumber(minNum: 1, maxNum: 5, minDen: 2, maxDen: 5)],
            ),
            ChapterRange(
              id: 1,
              title: locale.level_medium,
              numRanges: [ModelNumber(minNum: 1, maxNum: 5, minDen: 5, maxDen: 9)],
            ),
            ChapterRange(
              id: 2,
              title: locale.level_hard,
              numRanges: [ModelNumber(minNum: 1, maxNum: 9, minDen: 2, maxDen: 5)],
            ),
            ChapterRange(
              id: 3,
              title: locale.level_expert,
              numRanges: [ModelNumber(minNum: 1, maxNum: 9, minDen: 5, maxDen: 9)],
            ),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeFive,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.fractionsSubtraction.name,
          topicLabel: locale.topics_fractions,
          title: locale.chapter_fractions_subtraction,
          pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
          cover: "\\frac{1}{2} - \\frac{1}{3}",
          sort: baseTopicIndex + 8,
          ranges: [
            ChapterRange(
              id: 0,
              title: locale.level_easy,
              numRanges: [ModelNumber(minNum: 1, maxNum: 5, minDen: 2, maxDen: 5)],
            ),
            ChapterRange(
              id: 1,
              title: locale.level_medium,
              numRanges: [ModelNumber(minNum: 1, maxNum: 5, minDen: 5, maxDen: 9)],
            ),
            ChapterRange(
              id: 2,
              title: locale.level_hard,
              numRanges: [ModelNumber(minNum: 1, maxNum: 9, minDen: 2, maxDen: 5)],
            ),
            ChapterRange(
              id: 3,
              title: locale.level_expert,
              numRanges: [ModelNumber(minNum: 1, maxNum: 9, minDen: 5, maxDen: 9)],
            ),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeFive,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.fractionsMultiplication.name,
          topicLabel: locale.topics_fractions,
          title: locale.chapter_fractions_multiplication,
          pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
          cover: "\\frac{1}{2} \\times \\frac{1}{3}",
          sort: baseTopicIndex + 9,
          ranges: [
            ChapterRange(
              id: 0,
              title: locale.level_easy,
              numRanges: [ModelNumber(minNum: 1, maxNum: 5, minDen: 2, maxDen: 5)],
            ),
            ChapterRange(
              id: 1,
              title: locale.level_medium,
              numRanges: [ModelNumber(minNum: 1, maxNum: 5, minDen: 5, maxDen: 9)],
            ),
            ChapterRange(
              id: 2,
              title: locale.level_hard,
              numRanges: [ModelNumber(minNum: 1, maxNum: 9, minDen: 2, maxDen: 5)],
            ),
            ChapterRange(
              id: 3,
              title: locale.level_expert,
              numRanges: [ModelNumber(minNum: 1, maxNum: 9, minDen: 5, maxDen: 9)],
            ),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeFive,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.fractionsDivision.name,
          topicLabel: locale.topics_fractions,
          title: locale.chapter_fractions_division,
          pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
          cover: "\\frac{1}{2} : \\frac{1}{3}",
          sort: baseTopicIndex + 10,
          ranges: [
            ChapterRange(
              id: 0,
              title: locale.level_easy,
              numRanges: [ModelNumber(minNum: 1, maxNum: 5, minDen: 2, maxDen: 5)],
            ),
            ChapterRange(
              id: 1,
              title: locale.level_medium,
              numRanges: [ModelNumber(minNum: 1, maxNum: 5, minDen: 5, maxDen: 9)],
            ),
            ChapterRange(
              id: 2,
              title: locale.level_hard,
              numRanges: [ModelNumber(minNum: 1, maxNum: 9, minDen: 2, maxDen: 5)],
            ),
            ChapterRange(
              id: 3,
              title: locale.level_expert,
              numRanges: [ModelNumber(minNum: 1, maxNum: 9, minDen: 5, maxDen: 9)],
            ),
          ]),
    ];
    return (list);
  }
}
