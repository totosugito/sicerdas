import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import '../../auth/sign_in_screen.dart';

class AuthCTA extends ConsumerWidget {
  const AuthCTA({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;

    final theme = ShadTheme.of(context);

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 600),
        child: ShadCard(
          padding: const EdgeInsets.all(20),
          backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.05),
          border: ShadBorder.all(
            color: theme.colorScheme.primary.withValues(alpha: 0.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                l10n.welcome,
                style: theme.textTheme.large.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(l10n.signInMessage, style: theme.textTheme.muted),
              const SizedBox(height: 16),
              ShadButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const SignInScreen(),
                    ),
                  );
                },
                leading: const Padding(
                  padding: EdgeInsets.only(right: 8.0),
                  child: Icon(Icons.mail_outline_rounded, size: 16),
                ),
                child: Text(l10n.loginButton),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
