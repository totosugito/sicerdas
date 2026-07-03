import 'model_item.dart';
import 'model_chapter.dart';

class AchievementParent {
  late String assets;
  late String title; // chapter title
  late int score;
  late List<ModelChapter> child;

  AchievementParent(this.assets, this.title, this.score, this.child);
  
  AchievementParent.fromTopic(ModelItem topic){
    assets = topic.getAssets();
    title = topic.title;
    score = 0;
    child = [];
  }
}
