import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bse/core/auth/auth_notifier.dart';
import 'home/home_header.dart';
import 'home/quick_access_grid.dart';
import 'home/latest_books_section.dart';
import 'home/auth_cta.dart';
import 'home/offline_banner.dart';

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
              if (!isLoggedIn) ...[const SizedBox(height: 16), const AuthCTA()],
              const SizedBox(height: 16),
              const QuickAccessGrid(),
              const SizedBox(height: 16),
              const LatestBooksSection(),
              const SizedBox(height: 6),
            ],
          ),
        ),
      ),
    );
  }
}
