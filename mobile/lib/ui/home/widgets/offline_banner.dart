import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/providers/connectivity_provider.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';

class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectivity = ref.watch(connectivityProvider);
    final l10n = AppLocalizations.of(context)!;

    // Only show the banner if we are explicitly disconnected
    return connectivity.maybeWhen(
      data: (status) {
        if (status == InternetStatus.disconnected) {
          return Padding(
            padding: const EdgeInsets.only(top: 16.0),
            child: ShadAlert(
              icon: const Icon(Icons.wifi_off_rounded, size: 20),
              title: Text(
                l10n.offlineMessage,
                style: const TextStyle(fontSize: 13),
              ),
              // Using a subtle amber/yellow tone for the warning
              decoration: ShadDecoration(
                color: Colors.amber.withValues(alpha: 0.1),
                border: ShadBorder.all(
                  color: Colors.amber.withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
            ),
          );
        }
        return const SizedBox.shrink();
      },
      orElse: () => const SizedBox.shrink(),
    );
  }
}
