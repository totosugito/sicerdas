import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../core/auth/auth_notifier.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context, ref),
              if (!ref.watch(authStateProvider)) ...[
                const SizedBox(height: 24),
                _buildAuthCTA(ref),
              ],
              const SizedBox(height: 24),
              _buildQuickAccessGrid(context),
              const SizedBox(height: 24),
              _buildDynamicSections(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Halo, Siswa!',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () {},
                ),
                // ShadSwitch(
                //   value: false, // TODO: Bind to theme mode
                //   onChanged: (v) {},
                // ),
                IconButton(
                  icon: Icon(
                    ref.watch(authStateProvider) ? Icons.person : Icons.person_outline,
                    color: ref.watch(authStateProvider) ? Colors.blue : null,
                  ),
                  onPressed: () async {
                    if (ref.read(authStateProvider)) {
                      // Already logged in, maybe show profile or logout
                      final logout = await showDialog<bool>(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('Logout'),
                          content: const Text('Are you sure you want to logout?'),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                            TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Logout')),
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
        // ShadInput(
        //   placeholder: const Text('Search across modules...'),
        //   prefix: const Padding(
        //     padding: EdgeInsets.all(4.0),
        //     child: ShadImage.square(size: 16, lucide: LucideIcons.search),
        //   ),
        // ),
      ],
    );
  }

  Widget _buildQuickAccessGrid(BuildContext context) {
    final modules = [
      {'title': 'Buku Digital', 'icon': Icons.menu_book},
      {'title': 'Tabel Periodik', 'icon': Icons.science},
      {'title': 'Kamus', 'icon': Icons.translate},
      {'title': 'AI Assistant', 'icon': Icons.smart_toy},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.5,
      ),
      itemCount: modules.length,
      itemBuilder: (context, index) {
        final module = modules[index];
        return ShadCard(
          padding: const EdgeInsets.all(12),
          child: InkWell(
            onTap: () {},
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(module['icon'] as IconData, size: 32),
                const SizedBox(height: 8),
                Text(
                  module['title'] as String,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDynamicSections(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Buku Terbaru',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 200,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: 5,
            itemBuilder: (context, index) {
              return Container(
                width: 140,
                margin: const EdgeInsets.only(right: 16),
                child: ShadCard(
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Container(
                          color: Colors.grey[300],
                          width: double.infinity,
                          child: const Center(child: Icon(Icons.book, color: Colors.grey)),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Book Title ${index + 1}',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildAuthCTA(WidgetRef ref) {
    return ShadCard(
      padding: const EdgeInsets.all(20),
      backgroundColor: Colors.blue.withOpacity(0.05),
      border: ShadBorder.all(color: Colors.blue.withOpacity(0.2)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Selamat Datang!',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Masuk untuk mengakses semua fitur dan sinkronisasi data belajar Anda.',
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 16),
          ShadButton(
            onPressed: () => ref.read(authStateProvider.notifier).signIn(),
            leading: const Padding(
              padding: EdgeInsets.only(right: 8.0),
              child: Icon(Icons.login, size: 16),
            ),
            child: const Text('Masuk dengan Google'),
          ),
        ],
      ),
    );
  }
}
