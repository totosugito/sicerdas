import 'admob/admob_banner.dart';
import 'package:flutter/material.dart';

class AdsBanner extends StatefulWidget {
  final String adsUnit;

  const AdsBanner({super.key, required this.adsUnit});

  @override
  State<AdsBanner> createState() => AdsBannerState();
}

class AdsBannerState extends State<AdsBanner> {
  Widget createBannerAds() {
    return (AdmobBanner(adsUnitId: widget.adsUnit));
  }

  @override
  Widget build(BuildContext context) {
    return (createBannerAds());
  }
}
