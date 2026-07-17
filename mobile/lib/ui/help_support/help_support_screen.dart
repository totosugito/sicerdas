import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/core/config/env_config.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:bse/widgets/ads/ads_banner.dart';

class HelpSupportScreen extends ConsumerStatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  ConsumerState<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends ConsumerState<HelpSupportScreen> {
  final Map<int, bool> _expandedFaqs = {};

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);
    final theme = ShadTheme.of(context);

    final faqs = [
      _FaqItem(
        question: l10n.help_support.faqs.whatIsSicerdas.question,
        answer: l10n.help_support.faqs.whatIsSicerdas.answer,
      ),
      _FaqItem(
        question: l10n.help_support.faqs.howToRegister.question,
        answer: l10n.help_support.faqs.howToRegister.answer,
      ),
      _FaqItem(
        question: l10n.help_support.faqs.isThereCost.question,
        answer: l10n.help_support.faqs.isThereCost.answer,
      ),
      _FaqItem(
        question: l10n.help_support.faqs.offlineAccess.question,
        answer: l10n.help_support.faqs.offlineAccess.answer,
      ),
      _FaqItem(
        question: l10n.help_support.faqs.supportContact.question,
        answer: l10n.help_support.faqs.supportContact.answer.replaceAll(
          'support@sicerdas.com',
          EnvConfig.supportEmail,
        ),
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: Text(l10n.help_support.title), centerTitle: true),
      bottomNavigationBar: AdsBanner.buildBottomBar(ref),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Description
            ShadCard(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        LucideIcons.helpCircle,
                        color: theme.colorScheme.primary,
                        size: 24,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          l10n.help_support.title,
                          style: theme.textTheme.h3.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    l10n.help_support.description,
                    style: theme.textTheme.p.copyWith(
                      color: theme.colorScheme.mutedForeground,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Contact Card
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
                        l10n.help_support.contactTitle,
                        style: theme.textTheme.large.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    l10n.help_support.contactHours,
                    style: theme.textTheme.small.copyWith(
                      color: theme.colorScheme.mutedForeground,
                    ),
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
            const SizedBox(height: 16),
            ShadCard(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        LucideIcons.globe,
                        color: theme.colorScheme.primary,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        l10n.common.visitWebsite,
                        style: theme.textTheme.large.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    l10n.common.madeBy,
                    style: theme.textTheme.small.copyWith(
                      color: theme.colorScheme.mutedForeground,
                    ),
                  ),
                  const SizedBox(height: 16),
                  InkWell(
                    onTap: () async {
                      final url = Uri.parse(EnvConfig.websiteUrl);
                      if (await canLaunchUrl(url)) {
                        await launchUrl(url, mode: LaunchMode.externalApplication);
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
                            LucideIcons.externalLink,
                            size: 16,
                            color: theme.colorScheme.primary,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            EnvConfig.websiteUrl.replaceAll('https://', ''),
                            style: theme.textTheme.small.copyWith(
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.primary,
                              decoration: TextDecoration.underline,
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

            // FAQ Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4.0),
              child: Text(
                l10n.help_support.faqTitle,
                style: theme.textTheme.large.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 12),

            // FAQ List
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: faqs.length,
              itemBuilder: (context, index) {
                final faq = faqs[index];
                final isExpanded = _expandedFaqs[index] ?? false;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: ShadCard(
                    padding: EdgeInsets.zero,
                    child: Material(
                      color: Colors.transparent,
                      child: Theme(
                        data: Theme.of(
                          context,
                        ).copyWith(dividerColor: Colors.transparent),
                        child: ExpansionTile(
                          key: PageStorageKey<int>(index),
                          initiallyExpanded: isExpanded,
                          onExpansionChanged: (expanded) {
                            setState(() {
                              _expandedFaqs[index] = expanded;
                            });
                          },
                          leading: Icon(
                            LucideIcons.helpCircle,
                            color: isExpanded
                                ? theme.colorScheme.primary
                                : theme.colorScheme.mutedForeground,
                            size: 20,
                          ),
                          title: Text(
                            faq.question,
                            style: theme.textTheme.small.copyWith(
                              fontWeight: FontWeight.bold,
                              color: isExpanded
                                  ? theme.colorScheme.primary
                                  : theme.colorScheme.foreground,
                            ),
                          ),
                          trailing: Icon(
                            isExpanded
                                ? LucideIcons.chevronUp
                                : LucideIcons.chevronDown,
                            size: 16,
                            color: theme.colorScheme.mutedForeground,
                          ),
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(
                                16.0,
                                0,
                                16.0,
                                16.0,
                              ),
                              child: Align(
                                alignment: Alignment.topLeft,
                                child: Text(
                                  faq.answer,
                                  style: theme.textTheme.p.copyWith(
                                    color: theme.colorScheme.foreground
                                        .withValues(alpha: 0.8),
                                    height: 1.5,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _FaqItem {
  final String question;
  final String answer;

  const _FaqItem({required this.question, required this.answer});
}
