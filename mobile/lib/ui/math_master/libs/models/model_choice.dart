import 'enums.dart';
import 'my_number.dart';

class ModelChoice {
  int id = -1;
  bool status = false;
  String image = "";
  String text = "";
  MyNumber value;

  ModelChoice({
    required this.id,
    required this.status,
    required this.value,
    this.image = "",
  }) {
    switch (value.type) {
      case KeyDataType.image:
        text = image;
        break;
      default:
        text = value.toString();
        break;
    }
  }

  void cloneObject(ModelChoice m) {
    id = m.id;
    status = m.status;
    text = m.text;
    image = m.image;
    value.clone(m.value);
  }

  bool getStatus() {
    return (status);
  }

  void setText(String sstr) {
    text = sstr;
  }

  String getText() {
    return (text);
  }

  void updateText() {
    text = value.toString();
  }

  String getInfo() {
    return ("[$id]. $text");
  }
}
