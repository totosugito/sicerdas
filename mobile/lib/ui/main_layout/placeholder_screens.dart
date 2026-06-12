import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';

// BooksScreen moved to lib/ui/books/books_screen.dart

class DictionaryScreen extends StatelessWidget {
  const DictionaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l10n.common.nav.dictionary)),
      body: const Center(
        child: Icon(Icons.translate, size: 64, color: Colors.grey),
      ),
    );
  }
}
