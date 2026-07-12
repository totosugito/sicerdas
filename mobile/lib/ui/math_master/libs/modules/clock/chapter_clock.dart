import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_chapter.dart';
import '../../models/chapter_range.dart';
import '../../models/model_number.dart';

class ChapterClock {
  static List<ModelChapter> create(BuildContext context) {
    final locale = Translations.of(context).math_master;
    var topic = KeyTopic.topicClock;
    var baseTopicIndex = topic.index * 100;

    return [
      ModelChapter(
        grade: KeyGrade.gradeThree,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.clockMinutesToHours.name,
        topicLabel: locale.topics_clock,
        title: locale.chapter_clock_minutes_to_hours,
        pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
        cover:
            "120 \\text{ ${locale.minutes_sort_text} = \\ldots ${locale.hours_sort_text}}",
        sort: baseTopicIndex + 4,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_easy,
            desc: "[1 \\ldots 10] \\text{ ${locale.hours_sort_text}}",
            numRanges: [
              ModelNumber(
                min: 1,
                max: 10,
                minNum: 0,
                spacingNum: 0,
                maxNum: 0,
                minDen: 60,
                maxDen: 60,
              ),
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_medium,
            desc:
                "[1, 1\\frac{1}{2}, 2 \\ldots 10] \\text{ ${locale.hours_sort_text}}",
            numRanges: [
              ModelNumber(
                min: 1,
                max: 10,
                minNum: 0,
                spacingNum: 30,
                maxNum: 60,
                minDen: 60,
                maxDen: 60,
              ),
            ],
          ),
          ChapterRange(
            id: 2, // Note: changed from 3 to 2 for proper sequential indices
            title: locale.level_hard,
            desc:
                "[1, 1\\frac{1}{4}, 1\\frac{2}{4} \\ldots 10] \\text{ ${locale.hours_sort_text}}",
            numRanges: [
              ModelNumber(
                min: 1,
                max: 10,
                minNum: 0,
                spacingNum: 15,
                maxNum: 60,
                minDen: 60,
                maxDen: 60,
              ),
            ],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeThree,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.clockHoursToMinutes.name,
        topicLabel: locale.topics_clock,
        title: locale.chapter_clock_hours_to_Minutes,
        pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
        cover:
            "2 \\text{ ${locale.hours_sort_text} = \\ldots ${locale.minutes_sort_text}}",
        sort: baseTopicIndex + 5,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_easy,
            desc: "[1 \\ldots 10] \\text{ ${locale.hours_sort_text}}",
            numRanges: [
              ModelNumber(
                min: 1,
                max: 10,
                minNum: 0,
                spacingNum: 0,
                maxNum: 0,
                minDen: 60,
                maxDen: 60,
              ),
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_medium,
            desc:
                "[1, 1\\frac{1}{2}, 2 \\ldots 10] \\text{ ${locale.hours_sort_text}}",
            numRanges: [
              ModelNumber(
                min: 1,
                max: 10,
                minNum: 0,
                spacingNum: 30,
                maxNum: 60,
                minDen: 60,
                maxDen: 60,
              ),
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_hard,
            desc:
                "[1, 1\\frac{1}{4}, 1\\frac{2}{4} \\ldots 10] \\text{ ${locale.hours_sort_text}}",
            numRanges: [
              ModelNumber(
                min: 1,
                max: 10,
                minNum: 0,
                spacingNum: 15,
                maxNum: 60,
                minDen: 60,
                maxDen: 60,
              ),
            ],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeThree,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.clockElapsedTime.name,
        topicLabel: locale.topics_clock,
        title: locale.chapter_clock_elapsed_time,
        pads: const [KeyPadMode.padYesNo, KeyPadMode.pad4Pad],
        cover: "05:10 - 04:20",
        sort: baseTopicIndex + 6,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_breezy,
            desc: "[\\text{01:00, 02:00 \\ldots 12:00}]",
            numRanges: [
              ModelNumber(
                min: 1,
                max: 12,
                minNum: 0,
                spacingNum: 0,
                maxNum: 0,
                minDen: 60,
                maxDen: 60,
              ),
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_easy,
            desc: "[\\text{01:00, 01:30 \\ldots 12:00}]",
            numRanges: [
              ModelNumber(
                min: 1,
                max: 12,
                minNum: 0,
                spacingNum: 30,
                maxNum: 60,
                minDen: 60,
                maxDen: 60,
              ),
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_medium,
            desc: "[\\text{01:00, 01:15 \\ldots 12:00}]",
            numRanges: [
              ModelNumber(
                min: 1,
                max: 12,
                minNum: 0,
                spacingNum: 15,
                maxNum: 60,
                minDen: 60,
                maxDen: 60,
              ),
            ],
          ),
          ChapterRange(
            id: 3,
            title: locale.level_hard,
            desc: "[\\text{01:00, 01:05 \\ldots 12:00}]",
            numRanges: [
              ModelNumber(
                min: 1,
                max: 12,
                minNum: 0,
                spacingNum: 5,
                maxNum: 60,
                minDen: 60,
                maxDen: 60,
              ),
            ],
          ),
          ChapterRange(
            id: 4,
            title: locale.level_expert,
            desc: "[\\text{01:00, 01:05 \\ldots 24:00}]",
            numRanges: [
              ModelNumber(
                min: 1,
                max: 24,
                minNum: 0,
                spacingNum: 5,
                maxNum: 60,
                minDen: 60,
                maxDen: 60,
              ),
            ],
          ),
        ],
      ),
    ];
  }
}
