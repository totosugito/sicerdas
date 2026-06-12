import 'package:bse/i18n/strings.g.dart';

class PropertyDef {
  final String key;
  final String Function(Translations) getLabel;
  PropertyDef(this.key, this.getLabel);
}
