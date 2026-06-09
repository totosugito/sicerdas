import 'admob/admob_banner.dart';
import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class AdsBanner extends StatefulWidget {
  final String adsUnit;
  final bool showDivider;

  const AdsBanner({
    super.key,
    required this.adsUnit,
    this.showDivider = true,
  });

  @override
  State<AdsBanner> createState() => AdsBannerState();
}

class AdsBannerState extends State<AdsBanner> {
  Widget createBannerAds() {
    return AdmobBanner(adsUnitId: widget.adsUnit);
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final banner = createBannerAds();

    if (widget.showDivider) {
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
