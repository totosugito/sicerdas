import '../models/cl_mm_chapter.dart';
import '../models/enums.dart';
import '../models/model_chapter.dart';

class BaseMmTopic {
  final ClMmChapter chapter;
  final ModelChapter mdChapter;
  final KeyChapter keyChapter;

  BaseMmTopic(this.chapter, this.mdChapter, this.keyChapter);
}
