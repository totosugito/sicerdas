class ObjDict00 {
  late List<int> c;
  late List<String> s;

  void _init() {
    c = [];
    s = [];
  }

  ObjDict00() {
    _init();
  }

  bool isValid() {
    if (c.isEmpty || s.isEmpty) {
      return false;
    }
    if (c.length != s.length) {
      return false;
    }
    return true;
  }

  ObjDict00.fromJson(dynamic json) {
    _init();
    if (json == null || json.isEmpty) {
      return;
    }

    c = (json['c'] as List<dynamic>?)?.map((e) => e as int).toList() ?? [];
    s = (json['s'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [];
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'c': c,
      's': s,
    };
  }
}
