import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdmobBanner extends StatefulWidget {
  final String adsUnitId;

  const AdmobBanner({super.key, required this.adsUnitId});

  @override
  State<AdmobBanner> createState() => AdmobBannerState();
}

class AdmobBannerState extends State<AdmobBanner> {
  late BannerAd bannerAd;
  late bool isBannerAdReady = false;

  @override
  void initState() {
    super.initState();
    _createBannerAds();
  }

  @override
  void dispose() {
    bannerAd.dispose();
    super.dispose();
  }

  void _createBannerAds() {
    bannerAd = BannerAd(
      adUnitId: widget.adsUnitId,
      request: const AdRequest(),
      size: AdSize.banner,
      listener: BannerAdListener(
        onAdLoaded: (_) {
          setState(() {
            isBannerAdReady = true;
          });
        },
        onAdFailedToLoad: (ad, err) {
          if (kDebugMode) {
            print('Failed to load a banner ad: ${err.message}');
          }
          isBannerAdReady = false;
          ad.dispose();
        },
      ),
    );
    bannerAd.load();
  }

  @override
  Widget build(BuildContext context) {
    // show ads is true
    if (isBannerAdReady) {
      // ads is ready
      return Align(
        alignment: Alignment.topCenter,
        child: SizedBox(
          width: bannerAd.size.width.toDouble(),
          height: bannerAd.size.height.toDouble(),
          child: AdWidget(ad: bannerAd),
        ),
      );
    } else {
      return SizedBox(
        width: bannerAd.size.width.toDouble(),
        height: bannerAd.size.height.toDouble(),
      );
    }
  }
}
