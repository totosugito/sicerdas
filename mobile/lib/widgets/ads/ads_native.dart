import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'admob/admob_native.dart';
import 'ads_config.dart';

class AdsNative extends ConsumerWidget {
  final String? adsUnit;

  const AdsNative({super.key, this.adsUnit});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final adSettings = ref.watch(adSettingsProvider);
    final activeProvider = adSettings.provider;
    final unitId = adsUnit ?? adSettings.native;

    switch (activeProvider) {
      case AdProviderType.admob:
        return AdmobNative(adsUnitId: unitId);
      // Future cases:
      // case AdProviderType.unity:
      //   return UnityNative(adsUnitId: unitId);
    }
  }
}
