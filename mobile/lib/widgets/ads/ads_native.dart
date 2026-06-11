import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bse/core/providers/settings_provider.dart';
import 'admob/admob_native.dart';
import 'ads_config.dart';
export 'ads_config.dart';

class AdsNative extends ConsumerWidget {
  final String? adsUnit;
  final AdsTemplateType templateType;

  const AdsNative({
    super.key,
    this.adsUnit,
    this.templateType = AdsTemplateType.medium,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final showAds = ref.watch(appSettingsProvider)?.showAds ?? false;
    if (!showAds) return const SizedBox.shrink();

    final adSettings = ref.watch(adSettingsProvider);
    final activeProvider = adSettings.provider;
    final unitId = adsUnit ?? adSettings.native;

    switch (activeProvider) {
      case AdProviderType.admob:
        return AdmobNative(adsUnitId: unitId, templateType: templateType);
      // Future cases:
      // case AdProviderType.unity:
      //   return UnityNative(adsUnitId: unitId);
    }
  }
}
