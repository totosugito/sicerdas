import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'admob/admob_banner.dart';
import 'ads_config.dart';

class AdsBanner extends ConsumerWidget {
  final String? adsUnit;
  final bool showDivider;

  const AdsBanner({
    super.key,
    this.adsUnit,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final adSettings = ref.watch(adSettingsProvider);
    final activeProvider = adSettings.provider;
    final unitId = adsUnit ?? adSettings.banner;

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

    if (showDivider) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Divider(
            height: 1,
            thickness: 1,
            color: theme.colorScheme.border,
          ),
          banner,
        ],
      );
    }

    return banner;
  }
}
