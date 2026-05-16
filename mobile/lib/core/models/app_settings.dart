class AppSettings {
  final String cloudUrl;
  final AppAdsSettings ads;
  final AppLicenseSettings license;

  AppSettings({
    required this.cloudUrl,
    required this.ads,
    required this.license,
  });

  factory AppSettings.fromJson(Map<String, dynamic> json) {
    return AppSettings(
      cloudUrl: json['cloudUrl'] ?? '',
      ads: AppAdsSettings.fromJson(json['ads'] ?? {}),
      license: AppLicenseSettings.fromJson(json['license'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'cloudUrl': cloudUrl,
      'ads': ads.toJson(),
      'license': license.toJson(),
    };
  }
}

class AppAdsSettings {
  final int adsDelayCounter;
  final int adsDelayTimeInSec;
  final AppAdsUnitAndroid android;

  AppAdsSettings({
    required this.adsDelayCounter,
    required this.adsDelayTimeInSec,
    required this.android,
  });

  factory AppAdsSettings.fromJson(Map<String, dynamic> json) {
    return AppAdsSettings(
      adsDelayCounter: json['adsDelayCounter'] ?? 0,
      adsDelayTimeInSec: json['adsDelayTimeInSec'] ?? 0,
      android: AppAdsUnitAndroid.fromJson(json['adsUnitAndroid'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'adsDelayCounter': adsDelayCounter,
      'adsDelayTimeInSec': adsDelayTimeInSec,
      'adsUnitAndroid': android.toJson(),
    };
  }
}

class AppAdsUnitAndroid {
  final String adsProvider;
  final String banner;
  final String rewards;
  final String interstitial;
  final String native;

  AppAdsUnitAndroid({
    required this.adsProvider,
    required this.banner,
    required this.rewards,
    required this.interstitial,
    required this.native,
  });

  factory AppAdsUnitAndroid.fromJson(Map<String, dynamic> json) {
    return AppAdsUnitAndroid(
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

class AppLicenseSettings {
  final bool showAds;
  final String user;
  final String productId;
  final String pPurchaseStart;
  final String pPurchaseEnd;

  AppLicenseSettings({
    required this.showAds,
    required this.user,
    required this.productId,
    required this.pPurchaseStart,
    required this.pPurchaseEnd,
  });

  factory AppLicenseSettings.fromJson(Map<String, dynamic> json) {
    return AppLicenseSettings(
      showAds: json['showAds'] ?? false,
      user: json['user'] ?? '',
      productId: json['productId'] ?? '',
      pPurchaseStart: json['pPurchaseStart'] ?? '',
      pPurchaseEnd: json['pPurchaseEnd'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'showAds': showAds,
      'user': user,
      'productId': productId,
      'pPurchaseStart': pPurchaseStart,
      'pPurchaseEnd': pPurchaseEnd,
    };
  }
}
