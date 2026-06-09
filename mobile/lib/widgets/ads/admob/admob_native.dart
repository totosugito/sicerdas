import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdmobNative extends StatefulWidget {
  final String adsUnitId;

  const AdmobNative({super.key, required this.adsUnitId});

  @override
  State<AdmobNative> createState() => AdmobNativeState();
}

class AdmobNativeState extends State<AdmobNative> {
  NativeAd? _nativeAd;
  bool _nativeAdIsLoaded = false;
  double minWidth = 300;
  double minHeight = 350;
  double maxHeight = 400;
  double maxWidth = 450;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      _createAds();
    });
  }

  @override
  void dispose() {
    super.dispose();
    _nativeAd?.dispose();
  }

  void _createAds() {
    _nativeAd = NativeAd(
      adUnitId: widget.adsUnitId,
      request: const AdRequest(),
      listener: NativeAdListener(
        onAdLoaded: (Ad ad) {
          setState(() {
            _nativeAdIsLoaded = true;
          });
        },
        onAdFailedToLoad: (Ad ad, LoadAdError error) {
          ad.dispose();
        },
        onAdOpened: (Ad ad) {
          //print('$NativeAd onAdOpened.')
        },
        onAdClosed: (Ad ad) {
          //print('$NativeAd onAdClosed.')
        },
      ),
      nativeTemplateStyle: NativeTemplateStyle(
        templateType: TemplateType.medium,
        mainBackgroundColor: Colors.white12,
        callToActionTextStyle: NativeTemplateTextStyle(size: 16.0),
        primaryTextStyle: NativeTemplateTextStyle(
          textColor: Colors.black38,
          backgroundColor: Colors.white70,
        ),
      ),
    );

    _nativeAd?.load();
  }

  @override
  Widget build(BuildContext context) {
    if (_nativeAd != null && _nativeAdIsLoaded) {
      return Align(
        alignment: Alignment.center,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            minWidth: minWidth,
            minHeight: minHeight,
            maxHeight: maxHeight,
            maxWidth: maxWidth,
          ),
          child: AdWidget(ad: _nativeAd!),
        ),
      );
    } else {
      return (SizedBox(
        height: maxHeight,
        width: maxWidth,
        // color: Colors.green,
      ));
    }
  }
}
