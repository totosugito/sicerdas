import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../l10n/gen_l10n/bse2_localizations.dart';

class LatestBooksSection extends StatelessWidget {
  const LatestBooksSection({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = Bse2Localizations.of(context)!;
    final theme = ShadTheme.of(context);

    // Mock data for demo
    final books = [
      {
        'title': 'Fisika Modern',
        'author': 'Dr. Santoso',
        'image': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300',
        'isNew': true,
      },
      {
        'title': 'Sastra Indonesia',
        'author': 'Budi Utomo',
        'image': 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=300',
        'isNew': true,
      },
      {
        'title': 'Matematika Dasar',
        'author': 'Prof. Ahmad',
        'image': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=300',
        'isNew': false,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              l10n.latestBooks,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            TextButton(
              onPressed: () {},
              child: Row(
                children: [
                  Text(l10n.seeAll, style: TextStyle(color: theme.colorScheme.primary)),
                  const SizedBox(width: 4),
                  Icon(Icons.arrow_forward, size: 16, color: theme.colorScheme.primary),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 280,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: books.length,
            itemBuilder: (context, index) {
              final book = books[index];
              return _BookCard(
                title: book['title'] as String,
                author: book['author'] as String,
                imageUrl: book['image'] as String,
                isNew: book['isNew'] as bool,
                l10n: l10n,
              );
            },
          ),
        ),
      ],
    );
  }
}

class _BookCard extends StatelessWidget {
  final String title;
  final String author;
  final String imageUrl;
  final bool isNew;
  final Bse2Localizations l10n;

  const _BookCard({
    required this.title,
    required this.author,
    required this.imageUrl,
    required this.isNew,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: CachedNetworkImage(
                    imageUrl: imageUrl,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                    placeholder: (context, url) => Container(
                      color: Colors.grey[200],
                      child: const Center(child: CircularProgressIndicator()),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: Colors.grey[200],
                      child: const Icon(Icons.book, color: Colors.grey),
                    ),
                  ),
                ),
                if (isNew)
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.red[600],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        l10n.badgeNew,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          Text(
            author,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
}
