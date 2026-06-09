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

  static BaseInterstitialAd _createAd(String adsUnit, AdProviderType provider) {
    switch (provider) {
      case AdProviderType.admob:
        return AdmobInterstitialAd(adsUnit);
    }
  }

  void show() => _ad.show();
  void dispose() => _ad.dispose();
}
