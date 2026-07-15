import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';

import '../../models/enums.dart';
import '../../models/model_chapter.dart';
import '../../models/chapter_range.dart';
import '../../models/model_number.dart';

class ChapterPercents {
  static List<ModelChapter> create(BuildContext context) {
    final locale = Translations.of(context).math_master;
    var topic = KeyTopic.topicPercents;
    var baseTopicIndex = topic.index * 100;
    List<ModelChapter> list = [
      ModelChapter(
          grade: KeyGrade.gradeFive,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.percentsOfNumber.name,
          topicLabel: locale.topics_percents,
          title: locale.chapter_percents_of_number,
          cover: "70\\% \\text{ ${locale.of_text} } 100",
          sort: baseTopicIndex + 4,
          ranges: [
            ChapterRange(
                id: 0,
                title: locale.level_breezy,
                desc: "[10, 20, 30, \\ldots 100]",
                numRanges: [ModelNumber(min: 10, spacing: 10, max: 100), ModelNumber(min: 100, max: 100)]),
            ChapterRange(
                id: 1,
                title: locale.level_easy,
                desc: "[10, 20, 30, \\ldots 300]",
                numRanges: [ModelNumber(min: 10, spacing: 10, max: 100), ModelNumber(min: 100, spacing: 100, max: 300)]),
            ChapterRange(
                id: 2,
                title: locale.level_medium,
                desc: "[5, 10, 15, \\ldots 300]",
                numRanges: [ModelNumber(min: 5, spacing: 5, max: 100), ModelNumber(min: 100, spacing: 100, max: 300)]),
            ChapterRange(
                id: 3,
                title: locale.level_hard,
                desc: "[2, 4, 6, \\ldots 500]",
                numRanges: [ModelNumber(min: 2, spacing: 2, max: 100), ModelNumber(min: 100, spacing: 100, max: 500)]),
            ChapterRange(
                id: 4,
                title: locale.level_expert,
                desc: "[1, 2, 3, \\ldots 500]",
                numRanges: [ModelNumber(min: 1, max: 100), ModelNumber(min: 100, spacing: 100, max: 500)]),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeSix,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.percentsFromFractions.name,
          topicLabel: locale.topics_percents,
          title: locale.chapter_percents_from_fractions,
          cover: "\\frac{1}{2} = 50\\%",
          sort: baseTopicIndex + 7,
          ranges: [
            ChapterRange(
                id: 0,
                title: locale.level_easy,
                desc: "[\\frac{1}{10}, \\frac{2}{10}, \\ldots \\frac{10}{10}]",
                numRanges: [
                  ModelNumber(minNum: 1, spacingNum: 1, maxNum: 10, minDen: 10, maxDen: 10)
                ]),
            ChapterRange(
                id: 1,
                title: locale.level_medium,
                desc: "[\\frac{2}{20}, \\frac{4}{20}, \\ldots \\frac{20}{20}]",
                numRanges: [
                  ModelNumber(minNum: 2, spacingNum: 2, maxNum: 20, minDen: 20, maxDen: 20)
                ]),
            ChapterRange(
                id: 2,
                title: locale.level_hard,
                desc: "[\\frac{5}{50}, \\frac{10}{50}, \\ldots \\frac{50}{50}]",
                numRanges: [
                  ModelNumber(minNum: 5, spacingNum: 5, maxNum: 50, minDen: 50, maxDen: 50)
                ]),
            ChapterRange(
                id: 3,
                title: locale.level_expert,
                desc: "[\\frac{2}{50}, \\frac{4}{50}, \\ldots \\frac{50}{50}]",
                numRanges: [
                  ModelNumber(minNum: 2, spacingNum: 2, maxNum: 50, minDen: 50, maxDen: 50)
                ]),
          ]),
      ModelChapter(
          grade: KeyGrade.gradeSix,
          topic: topic,
          hasSolution: true,
          chapterKey: KeyChapter.percentsToFractions.name,
          topicLabel: locale.topics_percents,
          title: locale.chapter_percents_to_fractions,
          pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
          cover: "50\\% = \\frac{1}{2}",
          sort: baseTopicIndex + 8,
          ranges: [
            ChapterRange(
                id: 0,
                title: locale.level_easy,
                desc: "[\\frac{1}{10}, \\frac{2}{10}, \\ldots \\frac{10}{10}]",
                numRanges: [
                  ModelNumber(minNum: 1, spacingNum: 1, maxNum: 10, minDen: 10, maxDen: 10)
                ]),
            ChapterRange(
                id: 1,
                title: locale.level_medium,
                desc: "[\\frac{2}{20}, \\frac{4}{20}, \\ldots \\frac{20}{20}]",
                numRanges: [
                  ModelNumber(minNum: 2, spacingNum: 2, maxNum: 20, minDen: 20, maxDen: 20)
                ]),
            ChapterRange(
                id: 2,
                title: locale.level_hard,
                desc: "[\\frac{5}{50}, \\frac{10}{50}, \\ldots \\frac{50}{50}]",
                numRanges: [
                  ModelNumber(minNum: 5, spacingNum: 5, maxNum: 50, minDen: 50, maxDen: 50)
                ]),
            ChapterRange(
                id: 3,
                title: locale.level_expert,
                desc: "[\\frac{2}{50}, \\frac{4}{50}, \\ldots \\frac{50}{50}]",
                numRanges: [
                  ModelNumber(minNum: 2, spacingNum: 2, maxNum: 50, minDen: 50, maxDen: 50)
                ]),
          ]),
    ];
    return list;
  }
}
