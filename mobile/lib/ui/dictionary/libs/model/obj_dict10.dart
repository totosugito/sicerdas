class ObjDict10 {
  late List<String> t;
  late List<Dict10Example> e;

  void _init() {
    t = [];
    e = [];
  }

  ObjDict10() {
    _init();
  }

  ObjDict10.fromJson(dynamic json) {
    _init();
    if (json == null || json.isEmpty) {
      return;
    }

    t = (json['t'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [];
    e =
        (json['e'] as List<dynamic>?)
            ?.map((e) => Dict10Example.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
  }

  Map<String, dynamic> toJson() {
    return (<String, dynamic>{'t': t, 'e': e});
  }
}

class Dict10Example {
  late String s; // source sentence
  late String t; // translated sentence

  Dict10Example() {
    _init();
  }

  void _init() {
    s = "";
    t = "";
  }

  Dict10Example.fromJson(dynamic json) {
    _init();
    if (json == null || json.isEmpty) {
      return;
    }
    s = json['s'] as String? ?? "";
    t = json['t'] as String? ?? "";
  }

  Map<String, dynamic> toJson() {
    return (<String, dynamic>{'s': s, 't': t});
  }
}
