import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/auth/auth_notifier.dart';
import 'widgets/home_header.dart';
import 'widgets/quick_access_grid.dart';
import 'widgets/latest_books_section.dart';
import 'widgets/auth_cta.dart';
import 'widgets/offline_banner.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoggedIn = ref.watch(authStateProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const HomeHeader(),
              const OfflineBanner(),
              if (!isLoggedIn) ...[
                const SizedBox(height: 24),
                const AuthCTA(),
              ],
              const SizedBox(height: 24),
              const QuickAccessGrid(),
              const SizedBox(height: 24),
              const LatestBooksSection(),
            ],
          ),
        ),
      ),
    );
  }
}
