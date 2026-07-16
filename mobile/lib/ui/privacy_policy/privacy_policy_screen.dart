import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:bse/core/config/env_config.dart';
import 'package:bse/widgets/ads/ads_banner.dart';

class PrivacyPolicyScreen extends ConsumerWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = Translations.of(context);
    final theme = ShadTheme.of(context);

    final sections = [
      _PolicySection(
        icon: LucideIcons.info,
        title: l10n.privacy.introduction.title,
        content: l10n.privacy.introduction.content,
      ),
      _PolicySection(
        icon: LucideIcons.database,
        title: l10n.privacy.informationWeCollect.title,
        content: l10n.privacy.informationWeCollect.content,
      ),
      _PolicySection(
        icon: LucideIcons.eye,
        title: l10n.privacy.howWeUseInformation.title,
        content: l10n.privacy.howWeUseInformation.content,
      ),
      _PolicySection(
        icon: LucideIcons.users,
        title: l10n.privacy.dataSharing.title,
        content: l10n.privacy.dataSharing.content,
      ),
      _PolicySection(
        icon: LucideIcons.shieldCheck,
        title: l10n.privacy.dataSecurity.title,
        content: l10n.privacy.dataSecurity.content,
      ),
      _PolicySection(
        icon: LucideIcons.keyRound,
        title: l10n.privacy.yourRights.title,
        content: l10n.privacy.yourRights.content,
      ),
      _PolicySection(
        icon: LucideIcons.cookie,
        title: l10n.privacy.cookies.title,
        content: l10n.privacy.cookies.content,
      ),
      _PolicySection(
        icon: LucideIcons.refreshCw,
        title: l10n.privacy.changesToPolicy.title,
        content: l10n.privacy.changesToPolicy.content,
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: Text(l10n.privacy.title), centerTitle: true),
      bottomNavigationBar: AdsBanner.buildBottomBar(ref),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Card
            ShadCard(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.privacy.title,
                    style: theme.textTheme.h3.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(l10n.privacy.description, style: theme.textTheme.muted),
                  const SizedBox(height: 12),
                  Text(
                    l10n.privacy.updated,
                    style: theme.textTheme.small.copyWith(
                      color: theme.colorScheme.mutedForeground,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Content Sections
            ...sections.map(
              (section) => Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: ShadCard(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            section.icon,
                            color: theme.colorScheme.primary,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              section.title,
                              style: theme.textTheme.large.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        section.content,
                        style: theme.textTheme.p.copyWith(
                          color: theme.colorScheme.foreground.withValues(
                            alpha: 0.85,
                          ),
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Contact Us Card
            ShadCard(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        LucideIcons.mail,
                        color: theme.colorScheme.primary,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        l10n.privacy.contactUs.title,
                        style: theme.textTheme.large.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    l10n.privacy.contactUs.content,
                    style: theme.textTheme.p,
                  ),
                  const SizedBox(height: 16),
                  InkWell(
                    onTap: () async {
                      final emailLaunchUri = Uri(
                        scheme: 'mailto',
                        path: EnvConfig.supportEmail,
                      );
                      if (await canLaunchUrl(emailLaunchUri)) {
                        await launchUrl(emailLaunchUri);
                      }
                    },
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12.0),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.muted,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            LucideIcons.mail,
                            size: 16,
                            color: theme.colorScheme.primary,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            EnvConfig.supportEmail,
                            style: theme.textTheme.small.copyWith(
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _PolicySection {
  final IconData icon;
  final String title;
  final String content;

  const _PolicySection({
    required this.icon,
    required this.title,
    required this.content,
  });
}
