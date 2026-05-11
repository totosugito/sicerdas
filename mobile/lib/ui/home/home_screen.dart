import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

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
              _buildHeader(),
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

  Widget _buildHeader() {
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
                  icon: const Icon(Icons.person_outline),
                  onPressed: () {},
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
}
