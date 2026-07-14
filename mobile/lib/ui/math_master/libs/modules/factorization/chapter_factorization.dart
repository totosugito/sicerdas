import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../models/enums.dart';
import '../../models/model_chapter.dart';
import '../../models/chapter_range.dart';
import '../../models/model_number.dart';
import '../../solver/libs/html_lib.dart';

class ChapterFactorization {
  static List<ModelChapter> create(BuildContext context) {
    final locale = Translations.of(context).math_master;
    var topic = KeyTopic.topicPrimeFactorization;
    var baseTopicIndex = topic.index * 100;
    List<ModelChapter> list = [
      ModelChapter(
        grade: KeyGrade.gradeFour,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.factorizationGcf.name,
        topicLabel: locale.topics_factorization,
        title: locale.chapter_factorization_gcf,
        cover: sprintf("\\text{%s (10, 6)}", [
          locale.chapter_factorization_gcf_short,
        ]),
        sort: baseTopicIndex + 4,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_easy,
            desc: "[4 \\ldots 30]",
            numRanges: [
              ModelNumber(min: 2, max: 5),
              ModelNumber(min: 2, max: 5),
              ModelNumber(min: 2, max: 5),
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_medium,
            desc: "[4 \\ldots 70]",
            numRanges: [
              ModelNumber(min: 2, max: 9),
              ModelNumber(min: 2, max: 7),
              ModelNumber(min: 2, max: 7),
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_hard,
            desc: "[4 \\ldots 100]",
            numRanges: [
              ModelNumber(min: 2, max: 9),
              ModelNumber(min: 2, max: 9),
              ModelNumber(min: 2, max: 9),
            ],
          ),
          ChapterRange(
            id: 4,
            title: locale.level_expert,
            desc: "[4 \\ldots 100]",
            numRanges: [
              ModelNumber(min: 2, max: 5),
              ModelNumber(min: 2, max: 7),
              ModelNumber(min: 3, max: 8),
              ModelNumber(min: 4, max: 9),
            ],
          ),
        ],
      ),
      ModelChapter(
        grade: KeyGrade.gradeFour,
        topic: topic,
        hasSolution: true,
        chapterKey: KeyChapter.factorizationLcm.name,
        topicLabel: locale.topics_factorization,
        title: locale.chapter_factorization_lcm,
        cover: sprintf("\\text{%s (10, 6)}", [
          locale.chapter_factorization_lcm_short,
        ]),
        sort: baseTopicIndex + 5,
        ranges: [
          ChapterRange(
            id: 0,
            title: locale.level_easy,
            desc: "[2 \\ldots 6]",
            numRanges: [
              ModelNumber(min: 1, max: 1),
              ModelNumber(min: 2, max: 5),
              ModelNumber(min: 2, max: 5),
            ],
          ),
          ChapterRange(
            id: 1,
            title: locale.level_medium,
            desc: "[4 \\ldots 10]",
            numRanges: [
              ModelNumber(min: 1, max: 1),
              ModelNumber(min: 4, max: 9),
              ModelNumber(min: 4, max: 9),
            ],
          ),
          ChapterRange(
            id: 2,
            title: locale.level_hard,
            desc: "[2 \\ldots 30]",
            numRanges: [
              ModelNumber(min: 2, max: 2),
              ModelNumber(min: 2, max: 9),
              ModelNumber(min: 2, max: 9),
            ],
          ),
          ChapterRange(
            id: 4,
            title: locale.level_expert,
            desc: "[2 \\ldots 9]",
            numRanges: [
              ModelNumber(min: 1, max: 1),
              ModelNumber(min: 2, max: 9),
              ModelNumber(min: 2, max: 9),
              ModelNumber(min: 2, max: 9),
            ],
          ),
        ],
      ),
    ];
    return (list);
  }
}
