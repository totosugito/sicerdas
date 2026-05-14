import 'package:flutter/material.dart';
import '../l10n/gen_l10n/app_localizations.dart';

class BooksScreen extends StatelessWidget {
  const BooksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.navBooks)),
      body: const Center(child: Icon(Icons.menu_book, size: 64, color: Colors.grey)),
    );
  }
}

class DictionaryScreen extends StatelessWidget {
  const DictionaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.navDictionary)),
      body: const Center(child: Icon(Icons.translate, size: 64, color: Colors.grey)),
    );
  }
}


