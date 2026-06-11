import 'dart:io' show Platform;

class AppSettings {
  final String cloudUrl;
  final bool showAds;
  final AppAdsSettings ads;

  AppSettings({
    required this.cloudUrl,
    required this.showAds,
    required this.ads,
  });

  factory AppSettings.fromJson(Map<String, dynamic> json) {
    return AppSettings(
      cloudUrl: json['cloudUrl'] ?? '',
      showAds: json['showAds'] ?? true,
      ads: AppAdsSettings.fromJson(json['ads'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'cloudUrl': cloudUrl,
      'showAds': showAds,
      'ads': ads.toJson(),
    };
  }
}

class AppAdsSettings {
  final int adsDelayCounter;
  final int adsDelayTimeInSec;
  final AppAdsUnit android;
  final AppAdsUnit ios;

  AppAdsSettings({
    required this.adsDelayCounter,
    required this.adsDelayTimeInSec,
    required this.android,
    required this.ios,
  });

  AppAdsUnit get current => Platform.isIOS ? ios : android;

  factory AppAdsSettings.fromJson(Map<String, dynamic> json) {
    return AppAdsSettings(
      adsDelayCounter: json['adsDelayCounter'] ?? 0,
      adsDelayTimeInSec: json['adsDelayTimeInSec'] ?? 0,
      android: AppAdsUnit.fromJson(json['android'] ?? {}),
      ios: AppAdsUnit.fromJson(json['ios'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'adsDelayCounter': adsDelayCounter,
      'adsDelayTimeInSec': adsDelayTimeInSec,
      'android': android.toJson(),
      'ios': ios.toJson(),
    };
  }
}

class AppAdsUnit {
  final String adsProvider;
  final String banner;
  final String rewards;
  final String interstitial;
  final String native;

  AppAdsUnit({
    required this.adsProvider,
    required this.banner,
    required this.rewards,
    required this.interstitial,
    required this.native,
  });

  factory AppAdsUnit.fromJson(Map<String, dynamic> json) {
    return AppAdsUnit(
      adsProvider: json['adsProvider'] ?? '',
      banner: json['banner'] ?? '',
      rewards: json['rewards'] ?? '',
      interstitial: json['interstitial'] ?? '',
      native: json['native'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'adsProvider': adsProvider,
      'banner': banner,
      'rewards': rewards,
      'interstitial': interstitial,
      'native': native,
    };
  }
}
