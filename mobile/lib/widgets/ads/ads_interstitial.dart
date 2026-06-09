import 'package:bse/widgets/ads/admob/admob_interstitial.dart';

class AdsInterstitial {
  final String adsUnit;
  AdmobInterstitial? intersAdmob;
  AdsInterstitial({required this.adsUnit}) {
    intersAdmob = AdmobInterstitial(adsUnitId: adsUnit);
  }

  void dispose() {
    intersAdmob?.dispose();
  }

  void show() {
    intersAdmob?.show();
  }
}
