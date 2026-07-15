import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';

import '../../models/enums.dart';
import '../../models/model_chapter.dart';
import '../../models/chapter_range.dart';
import '../../models/model_number.dart';

class ChapterRoman {
  static List<ModelChapter> create(BuildContext context) {
    final locale = Translations.of(context).math_master;
    var topic = KeyTopic.topicRoman;
    var baseTopicIndex = topic.index * 100;
    List<ModelChapter> list = [
      ModelChapter(
        grade: KeyGrade.gradeFour,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.romanNumberToRoman.name,
        topicLabel: locale.topics_roman,
        title: locale.chapter_roman_number_to_roman,
        pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
        cover: "4 = \\text{IV}",
        sort: baseTopicIndex + 1,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_breezy,
            desc: "[1 \\ldots 10]",
            numRanges: [ModelNumber(min: 1, max: 10)],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_easy,
            desc: "[10 \\ldots 50]",
            numRanges: [ModelNumber(min: 10, max: 50)],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_medium,
            desc: "[50 \\ldots 100]",
            numRanges: [ModelNumber(min: 50, max: 100)],
          ),
          ChapterRange(
            id: 3,
            title: locale.level_hard,
            desc: "[100 \\ldots 500]",
            numRanges: [ModelNumber(min: 100, max: 500)],
          ),
          ChapterRange(
            id: 4,
            title: locale.level_expert,
            desc: "[500 \\ldots 1000]",
            numRanges: [ModelNumber(min: 500, max: 1000)],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeFour,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.romanRomanToNumber.name,
        topicLabel: locale.topics_roman,
        title: locale.chapter_roman_roman_to_number,
        pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
        cover: "\\text{IV} = 4",
        sort: baseTopicIndex + 2,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_breezy,
            desc: "[1 \\ldots 10]",
            numRanges: [ModelNumber(min: 1, max: 10)],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_easy,
            desc: "[10 \\ldots 50]",
            numRanges: [ModelNumber(min: 10, max: 50)],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_medium,
            desc: "[50 \\ldots 100]",
            numRanges: [ModelNumber(min: 50, max: 100)],
          ),
          ChapterRange(
            id: 3,
            title: locale.level_hard,
            desc: "[100 \\ldots 500]",
            numRanges: [ModelNumber(min: 100, max: 500)],
          ),
          ChapterRange(
            id: 4,
            title: locale.level_expert,
            desc: "[500 \\ldots 1000]",
            numRanges: [ModelNumber(min: 500, max: 1000)],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeFive,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.romanAddition.name,
        topicLabel: locale.topics_roman,
        title: locale.chapter_roman_addition,
        cover: "\\text{IV} + \\text{V} = 9",
        sort: baseTopicIndex + 3,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_easy,
            desc: "[1 \\ldots 9] + [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 1, max: 9),
              ModelNumber(min: 1, max: 9)
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_medium,
            desc: "[10 \\ldots 20] + [1 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 10, max: 20),
              ModelNumber(min: 1, max: 9)
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_hard,
            desc: "[10 \\ldots 20] + [10 \\ldots 20]",
            numRanges: [
              ModelNumber(min: 10, max: 20),
              ModelNumber(min: 10, max: 20)
            ],
          ),
          ChapterRange(
            id: 3,
            title: locale.level_expert,
            desc: "[20 \\ldots 50] + [10 \\ldots 50]",
            numRanges: [
              ModelNumber(min: 20, max: 50),
              ModelNumber(min: 10, max: 50)
            ],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeFive,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.romanSubtraction.name,
        topicLabel: locale.topics_roman,
        title: locale.chapter_roman_subtraction,
        cover: "\\text{V} - \\text{IV} = 1",
        sort: baseTopicIndex + 4,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_easy,
            desc: "[1 \\ldots 10] - [1 \\ldots 10]",
            numRanges: [
              ModelNumber(min: 1, max: 10),
              ModelNumber(min: 1, max: 10)
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_medium,
            desc: "[10 \\ldots 50] - [1 \\ldots 10]",
            numRanges: [
              ModelNumber(min: 10, max: 50),
              ModelNumber(min: 1, max: 10)
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_hard,
            desc: "[10 \\ldots 50] - [10 \\ldots 50]",
            numRanges: [
              ModelNumber(min: 10, max: 50),
              ModelNumber(min: 10, max: 50)
            ],
          ),
          ChapterRange(
            id: 3,
            title: locale.level_expert,
            desc: "[10 \\ldots 99] - [10 \\ldots 50]",
            numRanges: [
              ModelNumber(min: 10, max: 99),
              ModelNumber(min: 10, max: 50)
            ],
          ),
        ],
      ),
    ];
    return (list);
  }
}
