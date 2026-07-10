import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../libs/models/model_question.dart';

class UiMmStepsSolution extends StatefulWidget {
  final ModelQuestion question;

  const UiMmStepsSolution({
    super.key,
    required this.question,
  });

  static Future<dynamic> navigate({
    required BuildContext context,
    required ModelQuestion question,
  }) {
    return Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => UiMmStepsSolution(question: question),
      ),
    );
  }

  @override
  State<UiMmStepsSolution> createState() => _UiMmStepsSolutionState();
}

class _UiMmStepsSolutionState extends State<UiMmStepsSolution> {
  late final WebViewController _webViewController;

  @override
  void initState() {
    super.initState();

    final theme = ShadTheme.of(context, listen: false);
    final isDark = theme.brightness == Brightness.dark;

    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(isDark ? const Color(0xFF151515) : Colors.white);

    _loadSolutionHtml(isDark);
  }

  void _loadSolutionHtml(bool isDarkMode) {
    // Shared HTML/Tailwind CSS template between web and mobile versions
    final template = '''
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- KaTeX for rendering LaTeX formulas -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body);"></script>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
    }
    .dark-mode {
      background-color: #151515;
      color: #e5e7eb;
    }
    .light-mode {
      background-color: #ffffff;
      color: #1f2937;
    }
  </style>
</head>
<body class="p-6 \${isDarkMode ? 'dark-mode' : 'light-mode'} transition-colors duration-200">
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div class="border-b border-gray-200 dark:border-gray-800 pb-4">
      <span class="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">@module@</span>
      <h1 class="text-2xl font-bold mt-1 text-gray-900 dark:text-white">@chapter@</h1>
    </div>

    <!-- Question Section -->
    <div class="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
      <div class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Pertanyaan</div>
      <div class="text-xl font-bold text-gray-800 dark:text-gray-200">@question@</div>
    </div>

    <!-- Steps / Solution Section -->
    <div class="space-y-4">
      <div class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Langkah Penyelesaian</div>
      <div class="leading-relaxed text-gray-700 dark:text-zinc-300">
        @solution@
      </div>
    </div>

    <!-- Final Answer -->
    <div class="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg inline-block">
      <div class="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
        @answer@
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center text-xs text-gray-400 dark:text-zinc-600 pt-8 border-t border-gray-100 dark:border-zinc-900">
      &copy; @year@ BSE Math Master. All rights reserved.
    </div>
  </div>
</body>
</html>
''';

    final htmlContent = widget.question.solution.createHtml(
      html: template,
      isDarkMode: isDarkMode,
    );

    // Convert html string to data URI and load
    final uri = Uri.dataFromString(
      htmlContent,
      mimeType: 'text/html',
      encoding: Encoding.getByName('utf-8'),
    );
    _webViewController.loadRequest(uri);
  }

  @override
  Widget build(BuildContext context) {
    final locale = Translations.of(context).math_master;

    return Scaffold(
      appBar: AppBar(
        title: Text(locale.solution_text),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: WebViewWidget(controller: _webViewController),
    );
  }
}
