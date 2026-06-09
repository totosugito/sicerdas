import 'package:flutter/foundation.dart';

class AppConstants {
  static const String appDirParent = 'BSE';
  static const String appDirBooks = 'Books';
  static const String appDirKamus = 'Kamus';
  static const String appDirPeriodic = 'Periodic';

  // admob
  static const String bannerAdmob = kReleaseMode
      ? "ca-app-pub-1499065961898758/9439356495"
      : "ca-app-pub-3940256099942544/6300978111";
  static const String intersAdmob = kReleaseMode
      ? "ca-app-pub-1499065961898758/2472870697"
      : "ca-app-pub-3940256099942544/1033173712";
  static const String nativeAdmob = kReleaseMode
      ? "ca-app-pub-1499065961898758/4185407614"
      : "ca-app-pub-3940256099942544/2247696110";
}
