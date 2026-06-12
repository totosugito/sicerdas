import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bse/core/config/app_constants.dart';
import 'package:bse/core/providers/settings_provider.dart';

enum AdProviderType {
  admob,
  // Future providers can be added here
  // unity,
  // appLovin,
}

enum AdsTemplateType { small, medium }

class AdSettings {
  final AdProviderType provider;
  final String bannerId;
  final bool bannerEnabled;
  final String interstitialId;
  final bool interstitialEnabled;
  final String nativeId;
  final bool nativeEnabled;

  const AdSettings({
    required this.provider,
    required this.bannerId,
    required this.bannerEnabled,
    required this.interstitialId,
    required this.interstitialEnabled,
    required this.nativeId,
    required this.nativeEnabled,
  });
}

final adSettingsProvider = Provider<AdSettings>((ref) {
  final appSettings = ref.watch(appSettingsProvider);
  if (appSettings != null) {
    final adsUnit = appSettings.ads.current;

    final provider = AdProviderType.values.firstWhere(
      (e) => e.name.toLowerCase() == adsUnit.adsProvider.toLowerCase(),
      orElse: () => AdProviderType.admob,
    );

    return AdSettings(
      provider: provider,
      bannerId: adsUnit.banner.id.isNotEmpty
          ? adsUnit.banner.id
          : AppConstants.bannerAdmob,
      bannerEnabled: adsUnit.banner.enabled,
      interstitialId: adsUnit.interstitial.id.isNotEmpty
          ? adsUnit.interstitial.id
          : AppConstants.intersAdmob,
      interstitialEnabled: adsUnit.interstitial.enabled,
      nativeId: adsUnit.native.id.isNotEmpty
          ? adsUnit.native.id
          : AppConstants.nativeAdmob,
      nativeEnabled: adsUnit.native.enabled,
    );
  }

  // Fallback to defaults
  return const AdSettings(
    provider: AdProviderType.admob,
    bannerId: AppConstants.bannerAdmob,
    bannerEnabled: true,
    interstitialId: AppConstants.intersAdmob,
    interstitialEnabled: true,
    nativeId: AppConstants.nativeAdmob,
    nativeEnabled: true,
  );
});

final activeAdProvider = Provider<AdProviderType>((ref) {
  return ref.watch(adSettingsProvider).provider;
});

final showBannerAdsProvider = Provider<bool>((ref) {
  final showAds = ref.watch(appSettingsProvider)?.ads.enabled ?? false;
  final adSettings = ref.watch(adSettingsProvider);
  return showAds && adSettings.bannerEnabled;
});

final showNativeAdsProvider = Provider<bool>((ref) {
  final showAds = ref.watch(appSettingsProvider)?.ads.enabled ?? false;
  final adSettings = ref.watch(adSettingsProvider);
  return showAds && adSettings.nativeEnabled;
});
