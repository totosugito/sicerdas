import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../l10n/gen_l10n/bse2_localizations.dart';
import '../../settings/settings_screen.dart';

class HomeHeader extends ConsumerWidget {
  const HomeHeader({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = Bse2Localizations.of(context)!;
    final isLoggedIn = ref.watch(authStateProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              l10n.helloStudent,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () {},
                ),
                IconButton(
                  icon: const Icon(Icons.settings_outlined),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const SettingsScreen()),
                    );
                  },
                ),
                IconButton(
                  icon: Icon(
                    isLoggedIn ? Icons.person : Icons.person_outline,
                    color: isLoggedIn ? Colors.blue : null,
                  ),
                  onPressed: () async {
                    if (isLoggedIn) {
                      final logout = await showDialog<bool>(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: Text(l10n.logout),
                          content: Text(l10n.logoutConfirm),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(context, false), child: Text(l10n.cancel)),
                            TextButton(onPressed: () => Navigator.pop(context, true), child: Text(l10n.logout)),
                          ],
                        ),
                      );
                      if (logout == true) {
                        await ref.read(authStateProvider.notifier).signOut();
                      }
                    } else {
                      await ref.read(authStateProvider.notifier).signIn();
                    }
                  },
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}
