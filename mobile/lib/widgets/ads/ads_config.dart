import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/config/app_constants.dart';
import '../../core/providers/settings_provider.dart';

enum AdProviderType {
  admob,
  // Future providers can be added here
  // unity,
  // appLovin,
}

class AdSettings {
  final AdProviderType provider;
  final String banner;
  final String interstitial;
  final String native;

  const AdSettings({
    required this.provider,
    required this.banner,
    required this.interstitial,
    required this.native,
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
      banner: adsUnit.banner.isNotEmpty ? adsUnit.banner : AppConstants.bannerAdmob,
      interstitial: adsUnit.interstitial.isNotEmpty ? adsUnit.interstitial : AppConstants.intersAdmob,
      native: adsUnit.native.isNotEmpty ? adsUnit.native : AppConstants.nativeAdmob,
    );
  }

  // Fallback to defaults
  return const AdSettings(
    provider: AdProviderType.admob,
    banner: AppConstants.bannerAdmob,
    interstitial: AppConstants.intersAdmob,
    native: AppConstants.nativeAdmob,
  );
});

final activeAdProvider = Provider<AdProviderType>((ref) {
  return ref.watch(adSettingsProvider).provider;
});
