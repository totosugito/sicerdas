import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../libs/models/model_question.dart';

class UiMmStepsSolution extends StatefulWidget {
  final ModelQuestion question;

  const UiMmStepsSolution({super.key, required this.question});

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
      ..setBackgroundColor(isDark ? const Color(0xFF151515) : Colors.white)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) {
            final data = {
              'isDarkMode': isDark,
              'module': widget.question.solution.module,
              'chapter': widget.question.solution.chapter,
              'question': widget.question.solution.question,
              'solution': widget.question.solution.solution,
              'answer': widget.question.solution.answer,
              'year': DateTime.now().year.toString(),
            };
            _webViewController.runJavaScript(
              'updateContent(${jsonEncode(data)})',
            );
          },
        ),
      )
      ..loadFlutterAsset('assets/katex-0.17.0/solution.html');
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
