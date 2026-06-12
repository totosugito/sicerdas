import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'admob/admob_interstitial.dart';
import 'ads_config.dart';

abstract class BaseInterstitialAd {
  void show();
  void dispose();
}

class AdmobInterstitialAd implements BaseInterstitialAd {
  final AdmobInterstitial _ad;

  AdmobInterstitialAd(String unitId) : _ad = AdmobInterstitial(adsUnitId: unitId);

  @override
  void show() => _ad.show();

  @override
  void dispose() => _ad.dispose();
}

class AdsInterstitial {
  final BaseInterstitialAd _ad;

  AdsInterstitial({
    required String adsUnit,
    AdProviderType provider = AdProviderType.admob,
  }) : _ad = _createAd(adsUnit, provider);

  factory AdsInterstitial.fromRef(Ref ref, {String? adsUnit, AdProviderType? provider}) {
    final adSettings = ref.read(adSettingsProvider);
    return AdsInterstitial(
      adsUnit: adsUnit ?? adSettings.interstitialId,
      provider: provider ?? adSettings.provider,
    );
  }

  factory AdsInterstitial.fromWidgetRef(WidgetRef ref, {String? adsUnit, AdProviderType? provider}) {
    final adSettings = ref.read(adSettingsProvider);
    return AdsInterstitial(
      adsUnit: adsUnit ?? adSettings.interstitialId,
      provider: provider ?? adSettings.provider,
    );
  }

  static BaseInterstitialAd _createAd(String adsUnit, AdProviderType provider) {
    switch (provider) {
      case AdProviderType.admob:
        return AdmobInterstitialAd(adsUnit);
    }
  }

  void show() => _ad.show();
  void dispose() => _ad.dispose();
}
