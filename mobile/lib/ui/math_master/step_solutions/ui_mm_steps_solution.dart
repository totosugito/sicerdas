import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../libs/models/model_question.dart';
import 'lib/solution_html.dart';

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
  bool _isPageFinished = false;

  String _getCorrectAnswer() {
    if (widget.question.choices.isEmpty &&
        widget.question.choicesBool.isEmpty) {
      return widget.question.solution.answer;
    }

    final correctChoice = widget.question.choices.isNotEmpty
        ? widget.question.choices.firstWhere(
            (c) => c.status,
            orElse: () => widget.question.choices.first,
          )
        : widget.question.choicesBool.firstWhere(
            (c) => c.status,
            orElse: () => widget.question.choicesBool.first,
          );

    if (correctChoice.value.valueText.isNotEmpty) {
      return correctChoice.value.valueText;
    }

    final val = correctChoice.value.value;
    if (val % 1 == 0) {
      return val.toInt().toString();
    }
    return val.toString();
  }

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
            final correctAnswerText = _getCorrectAnswer();

            final locale = Translations.of(context).math_master;

            final currentYear = DateTime.now().year.toString();
            final copyrightText = locale.copyright(year: currentYear);

            // Generate the dynamic HTML layout from Dart template (enabling hot reload)
            final htmlContent = getSolutionHtml(
              module: widget.question.solution.module,
              chapter: widget.question.solution.chapter,
              question: widget.question.solution.question,
              solution: widget.question.solution.solution,
              answer: correctAnswerText,
              labelCopyright: copyrightText,
              labelQuestion: locale.question_label,
              labelSteps: locale.steps_label,
              labelResult: locale.result_label,
            );

            final data = {
              'isDarkMode': isDark,
              'html': htmlContent,
              'module': widget.question.solution.module,
              'chapter': widget.question.solution.chapter,
              'question': widget.question.solution.question,
              'solution': widget.question.solution.solution,
              'answer': correctAnswerText,
              'year': currentYear,
            };
            _webViewController.runJavaScript(
              'updateContent(${jsonEncode(data)})',
            );

            if (mounted) {
              setState(() {
                _isPageFinished = true;
              });
            }
          },
        ),
      )
      ..loadFlutterAsset('assets/katex-0.17.0/solution.html');
  }

  @override
  Widget build(BuildContext context) {
    final locale = Translations.of(context).math_master;
    final theme = ShadTheme.of(context); // Listen to theme changes
    final isDark = theme.brightness == Brightness.dark;

    if (_isPageFinished) {
      _webViewController.setBackgroundColor(
        isDark ? const Color(0xFF151515) : Colors.white,
      );
      _webViewController.runJavaScript('''
        if ($isDark) {
          document.documentElement.className = "dark";
          document.body.className = "dark-mode dark";
        } else {
          document.documentElement.className = "";
          document.body.className = "light-mode";
        }
      ''');
    }

    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (BuildContext context, bool innerBoxIsScrolled) {
          return <Widget>[
            SliverAppBar(
              title: Text(locale.solution_text),
              pinned: true,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ];
        },
        body: WebViewWidget(controller: _webViewController),
      ),
    );
  }
}
