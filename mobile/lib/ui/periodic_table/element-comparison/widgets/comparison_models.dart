import '../../../../l10n/gen_l10n/app_localizations.dart';

class PropertyDef {
  final String key;
  final String Function(AppLocalizations) getLabel;
  PropertyDef(this.key, this.getLabel);
}
