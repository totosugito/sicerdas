import envConfig from "../../config/env.config.ts";

function createAdPlacement(id?: string, enabled?: boolean) {
  const adId = id || "";
  return {
    id: adId,
    enabled: adId.trim().length > 0 && enabled !== false,
  };
}

export function getAppSettings(showAds: boolean) {
  return {
    cloudUrl: envConfig.server.s3Storage.publicUrl || "",
    ads: {
      enabled: showAds,
      adsDelayCounter: envConfig.ads.delayCounter,
      adsDelayTimeInSec: envConfig.ads.delayTimeInSec,
      android: {
        adsProvider: envConfig.ads.android.provider,
        banner: createAdPlacement(envConfig.ads.android.bannerId, envConfig.ads.android.bannerEnabled),
        rewards: createAdPlacement(envConfig.ads.android.rewardedId, envConfig.ads.android.rewardedEnabled),
        interstitial: createAdPlacement(envConfig.ads.android.interstitialId, envConfig.ads.android.interstitialEnabled),
        native: createAdPlacement(envConfig.ads.android.nativeId, envConfig.ads.android.nativeEnabled),
      },
      ios: {
        adsProvider: envConfig.ads.ios.provider,
        banner: createAdPlacement(envConfig.ads.ios.bannerId, envConfig.ads.ios.bannerEnabled),
        rewards: createAdPlacement(envConfig.ads.ios.rewardedId, envConfig.ads.ios.rewardedEnabled),
        interstitial: createAdPlacement(envConfig.ads.ios.interstitialId, envConfig.ads.ios.interstitialEnabled),
        native: createAdPlacement(envConfig.ads.ios.nativeId, envConfig.ads.ios.nativeEnabled),
      },
    },
  };
}
