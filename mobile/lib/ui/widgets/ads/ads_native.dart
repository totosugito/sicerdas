import 'admob/admob_native.dart';
import 'package:flutter/material.dart';

class AdsNative extends StatefulWidget {
  final String adsUnit;

  const AdsNative({super.key, required this.adsUnit});

  @override
  State<AdsNative> createState() => AdsNativeState();
}

class AdsNativeState extends State<AdsNative> {
  @override
  Widget build(BuildContext context) {
    return (AdmobNative(adsUnitId: widget.adsUnit));
  }
}
