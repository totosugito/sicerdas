import 'model_number.dart';

class ChapterRange {
  final int id; // range id
  final String title; // range title
  final String desc; // range description
  final List<ModelNumber> numRanges;
  final List<num> ranges;

  ChapterRange({
    required this.id,
    required this.title,
    this.desc = "",
    this.numRanges = const [],
    this.ranges = const [],
  });
}
