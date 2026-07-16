import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'admob/admob_banner.dart';
import 'ads_config.dart';

class AdsBanner extends ConsumerWidget {
  final String? adsUnit;
  final bool showDivider;
  final EdgeInsetsGeometry? padding;

  const AdsBanner({
    super.key,
    this.adsUnit,
    this.showDivider = true,
    this.padding,
  });

  /// Builds the ads banner widget if ads are enabled in the settings.
  /// Otherwise, returns null to avoid layout issues in Scaffold.
  static Widget? buildBottomBar(
    WidgetRef ref, {
    String? adsUnit,
    bool showDivider = true,
    EdgeInsetsGeometry? padding,
  }) {
    final showBanner = ref.watch(showBannerAdsProvider);
    final isEnabled = adsUnit?.isNotEmpty ?? showBanner;
    if (!isEnabled) return null;

    return AdsBanner(
      adsUnit: adsUnit,
      showDivider: showDivider,
      padding: padding,
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final adSettings = ref.watch(adSettingsProvider);
    final activeProvider = adSettings.provider;
    final unitId = adsUnit ?? adSettings.bannerId;
    if (unitId.trim().isEmpty) return const SizedBox.shrink();

    Widget banner;
    switch (activeProvider) {
      case AdProviderType.admob:
        banner = AdmobBanner(adsUnitId: unitId);
        break;
      // Future cases:
      // case AdProviderType.unity:
      //   banner = UnityBanner(adsUnitId: unitId);
      //   break;
    }

    final content = showDivider
        ? Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Divider(height: 1, thickness: 1, color: theme.colorScheme.border),
              banner,
            ],
          )
        : banner;

    return Padding(
      padding: padding ?? const EdgeInsets.only(top: 4),
      child: content,
    );
  }
}
