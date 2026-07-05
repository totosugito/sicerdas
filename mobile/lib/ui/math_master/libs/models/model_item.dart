class ModelItem {
  int id = 0;
  String key = "";
  String title = "";
  String assets = '';

  ModelItem({
    required this.id,
    required this.key,
    required this.title,
    this.assets = '',
  });

  ModelItem.create() {
    id = 0;
    key = "";
    title = "";
    assets = '';
  }

  ModelItem.clone(ModelItem old) {
    clone(old);
  }

  void clone(ModelItem old) {
    id = old.id;
    key = old.key;
    title = old.title;
    assets = old.assets;
  }

  String getAssets() {
    if (assets.isEmpty) {
      return ('');
    }
    return ('assets/images/math/$assets.png');
  }
}
