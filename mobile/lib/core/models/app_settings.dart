import 'dart:io' show Platform;

class AppSettings {
  final String cloudUrl;
  final AppAdsSettings ads;

  AppSettings({
    required this.cloudUrl,
    required this.ads,
  });

  factory AppSettings.fromJson(Map<String, dynamic> json) {
    return AppSettings(
      cloudUrl: json['cloudUrl'] ?? '',
      ads: AppAdsSettings.fromJson(json['ads'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'cloudUrl': cloudUrl,
      'ads': ads.toJson(),
    };
  }
}

class AppAdsSettings {
  final bool enabled;
  final int adsDelayCounter;
  final int adsDelayTimeInSec;
  final AppAdsUnit android;
  final AppAdsUnit ios;

  AppAdsSettings({
    required this.enabled,
    required this.adsDelayCounter,
    required this.adsDelayTimeInSec,
    required this.android,
    required this.ios,
  });

  AppAdsUnit get current => Platform.isIOS ? ios : android;

  factory AppAdsSettings.fromJson(Map<String, dynamic> json) {
    return AppAdsSettings(
      enabled: json['enabled'] ?? true,
      adsDelayCounter: json['adsDelayCounter'] ?? 0,
      adsDelayTimeInSec: json['adsDelayTimeInSec'] ?? 0,
      android: AppAdsUnit.fromJson(json['android'] ?? {}),
      ios: AppAdsUnit.fromJson(json['ios'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'enabled': enabled,
      'adsDelayCounter': adsDelayCounter,
      'adsDelayTimeInSec': adsDelayTimeInSec,
      'android': android.toJson(),
      'ios': ios.toJson(),
    };
  }
}

class AppAdPlacement {
  final String id;
  final bool enabled;

  AppAdPlacement({
    required this.id,
    required this.enabled,
  });

  factory AppAdPlacement.fromJson(Map<String, dynamic> json) {
    return AppAdPlacement(
      id: json['id'] ?? '',
      enabled: json['enabled'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'enabled': enabled,
    };
  }
}

class AppAdsUnit {
  final String adsProvider;
  final AppAdPlacement banner;
  final AppAdPlacement rewards;
  final AppAdPlacement interstitial;
  final AppAdPlacement native;

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
      banner: AppAdPlacement.fromJson(json['banner'] ?? {}),
      rewards: AppAdPlacement.fromJson(json['rewards'] ?? {}),
      interstitial: AppAdPlacement.fromJson(json['interstitial'] ?? {}),
      native: AppAdPlacement.fromJson(json['native'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'adsProvider': adsProvider,
      'banner': banner.toJson(),
      'rewards': rewards.toJson(),
      'interstitial': interstitial.toJson(),
      'native': native.toJson(),
    };
  }
}
