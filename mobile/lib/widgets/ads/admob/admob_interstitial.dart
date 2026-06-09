import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdmobInterstitial {
  final String adsUnitId;
  AdmobInterstitial({required this.adsUnitId});

  InterstitialAd? _interstitial;

  void dispose() {
    _interstitial?.dispose();
  }

  void show() {
    InterstitialAd.load(
      adUnitId: adsUnitId,
      request: const AdRequest(mediationExtras: []),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitial = ad;
          _interstitial?.show();
        },
        onAdFailedToLoad: (err) {},
      ),
    );
  }
}
