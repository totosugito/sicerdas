import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/widgets/ads/ads_banner.dart';
import 'package:bse/widgets/confirmation_dialog.dart';
import '../libs/providers/math_tricks_repository.dart';
import '../libs/tricks_question_generator.dart';
import '../libs/widgets/keypad_mode.dart';
import '../libs/widgets/multiple_choice_pad.dart';
import '../libs/widgets/numeric_key_pad.dart';
import '../libs/widgets/yes_no_pad.dart';
import 'widgets/finished_view.dart';
import 'widgets/question_card.dart';
import 'widgets/progress_dots.dart';
import 'widgets/solution_sheet.dart';
import 'widgets/training_app_bar.dart';

class TricksTrainingScreen extends ConsumerStatefulWidget {
  final String chapterKey;
  final String trickTitle;
  final int level;
  final Color themeColor;
  final VoidCallback onComplete;
  final KeyPadMode? initialKeyPadMode;

  const TricksTrainingScreen({
    super.key,
    required this.chapterKey,
    required this.trickTitle,
    required this.level,
    required this.themeColor,
    required this.onComplete,
    this.initialKeyPadMode,
  });

  static void navigate(
    BuildContext context, {
    required String chapterKey,
    required String trickTitle,
    required int level,
    required Color themeColor,
    required VoidCallback onComplete,
    KeyPadMode? initialKeyPadMode,
  }) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TricksTrainingScreen(
          chapterKey: chapterKey,
          trickTitle: trickTitle,
          level: level,
          themeColor: themeColor,
          onComplete: onComplete,
          initialKeyPadMode: initialKeyPadMode,
        ),
      ),
    );
  }

  @override
  ConsumerState<TricksTrainingScreen> createState() =>
      _TricksTrainingScreenState();
}

class _TricksTrainingScreenState extends ConsumerState<TricksTrainingScreen> {
  static const int _totalQuestions = 5;
  int _currentQuestionIndex = 0;
  int _correctAnswers = 0;
  int _wrongAnswers = 0;

  late GeneratedQuestion _currentQuestion;
  final List<bool?> _questionResults = List.filled(
    _totalQuestions,
    null,
  ); // null = unplayed, true = correct, false = wrong

  // Timer
  late Timer _timer;
  int _secondsElapsed = 0;

  // State management
  bool _answered = false;
  num? _selectedAnswer;
  String _numInput = ''; // for NumPad mode
  KeyPadMode _currentPadMode = KeyPadMode.multipleChoice;
  bool? _selectedYes;
  bool? _userAnswerCorrect;
  num? _proposedAnswer;
  final math.Random _random = math.Random();
  bool _isTrainingFinished = false;

  @override
  void initState() {
    super.initState();
    _generateNextQuestion();
    final supported = _currentQuestion.supportedKeyPads;
    if (widget.initialKeyPadMode != null &&
        supported.contains(widget.initialKeyPadMode)) {
      _currentPadMode = widget.initialKeyPadMode!;
    } else if (supported.isNotEmpty) {
      final preferredIndex = 0; //widget.level % supported.length;
      _currentPadMode = supported[preferredIndex];
    } else {
      _currentPadMode = KeyPadMode.multipleChoice;
    }
    _startTimer();
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isTrainingFinished) {
        setState(() {
          _secondsElapsed++;
        });
      }
    });
  }

  void _generateNextQuestion() {
    _currentQuestion = TricksQuestionGenerator.generate(
      widget.chapterKey,
      widget.level,
    );
    _answered = false;
    _selectedAnswer = null;
    _numInput = '';
    _selectedYes = null;
    _userAnswerCorrect = null;

    final bool showCorrect = _random.nextBool();
    if (showCorrect) {
      _proposedAnswer = _currentQuestion.answer;
    } else {
      final distractors = _currentQuestion.choices
          .where((c) => c != _currentQuestion.answer)
          .toList();
      if (distractors.isNotEmpty) {
        _proposedAnswer = distractors[_random.nextInt(distractors.length)];
      } else {
        _proposedAnswer = _currentQuestion.answer + 10;
      }
    }
  }

  void _onAnswerSubmitted(num answer) {
    if (_answered) return;

    setState(() {
      _answered = true;
      _selectedAnswer = answer;
      final isCorrect = (answer == _currentQuestion.answer);

      _questionResults[_currentQuestionIndex] = isCorrect;

      if (isCorrect) {
        _correctAnswers++;
      } else {
        _wrongAnswers++;
      }
    });

    _nextQuestionDelayed();
  }

  void _onYesNoAnswered(bool chosenYes) {
    if (_answered) return;

    final bool isProposedAnswerCorrect =
        (_proposedAnswer == _currentQuestion.answer);
    final bool correct = (chosenYes == isProposedAnswerCorrect);

    setState(() {
      _answered = true;
      _selectedYes = chosenYes;
      _userAnswerCorrect = correct;
      _questionResults[_currentQuestionIndex] = correct;

      if (correct) {
        _correctAnswers++;
      } else {
        _wrongAnswers++;
      }
    });

    _nextQuestionDelayed();
  }

  void _nextQuestionDelayed() {
    Future.delayed(const Duration(milliseconds: 1000), () {
      if (!mounted) return;
      if (_currentQuestionIndex + 1 < _totalQuestions) {
        setState(() {
          _currentQuestionIndex++;
          _generateNextQuestion();
        });
      } else {
        _finishTraining();
      }
    });
  }

  Future<void> _finishTraining() async {
    setState(() {
      _isTrainingFinished = true;
    });
    _timer.cancel();

    // Calculate stars
    int stars = 0;
    if (_correctAnswers == 5) {
      stars = 3;
    } else if (_correctAnswers >= 4) {
      stars = 2;
    } else if (_correctAnswers >= 3) {
      stars = 1;
    }

    final score = _correctAnswers * 10;

    // Save to Drift SQLite DB
    final repo = ref.read(mathTricksRepositoryProvider);
    await repo.saveLevelResult(
      widget.chapterKey,
      widget.level,
      _correctAnswers,
      _wrongAnswers,
      score,
      _secondsElapsed,
      stars,
    );

    // Save daily stats
    await repo.addDailyScore(DateTime.now(), _correctAnswers, _wrongAnswers);

    widget.onComplete();
  }

  String _formatTime(int totalSeconds) {
    final int minutes = totalSeconds ~/ 60;
    final int seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void _showSolutionBottomSheet(BuildContext context) {
    if (!_answered) {
      // Viewing the solution before answering counts as a wrong answer
      _onAnswerSubmitted(_currentQuestion.answer + 1);
    }

    SolutionSheet.show(
      context,
      htmlContent: _currentQuestion.buildSolutionHtml(context),
    );
  }

  @override
  Widget build(BuildContext context) {
    print("build");
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (_isTrainingFinished) {
      return _buildFinishedScreen(theme, l10n, isDark);
    }

    return Scaffold(
      appBar: TrainingAppBar(
        trickTitle: widget.trickTitle,
        themeColor: widget.themeColor,
        currentPadMode: _currentPadMode,
        formattedTime: _formatTime(_secondsElapsed),
        showPadToggle: _currentQuestion.supportedKeyPads.length > 1,
        onExitPressed: () {
          // Confirm exit
          ConfirmationDialog.show(
            context,
            icon: LucideIcons.triangleAlert,
            title: l10n.math_tricks.training.exitTitle,
            description: l10n.math_tricks.training.exitDescription,
            confirmLabel: l10n.math_tricks.training.exitButton,
            cancelLabel: l10n.common.cancel,
            onConfirm: () {
              Navigator.of(context).pop(); // Dismiss dialog
              Navigator.of(context).pop(); // Exit screen
            },
          );
        },
        onPadModeToggle: () {
          final supported = _currentQuestion.supportedKeyPads;
          if (supported.length > 1) {
            setState(() {
              final currentIndex = supported.indexOf(_currentPadMode);
              final nextIndex = (currentIndex + 1) % supported.length;
              _currentPadMode = supported[nextIndex];
              _numInput = ''; // Clear input
            });
          }
        },
        onShowSolution: () => _showSolutionBottomSheet(context),
      ),
      body: SafeArea(
        child: Builder(
          builder: (context) {
            final isLandscape =
                MediaQuery.of(context).orientation == Orientation.landscape;
            Widget content = Column(
              children: [
                // Progress Dots Bar
                ProgressDots(
                  totalQuestions: _totalQuestions,
                  currentQuestionIndex: _currentQuestionIndex,
                  questionResults: _questionResults,
                  themeColor: widget.themeColor,
                  isDark: isDark,
                ),

                if (isLandscape) const SizedBox(height: 12) else const Spacer(),

                // Question Card
                TrainingQuestionCard(
                  questionText: _currentQuestion.questionText,
                  isYesNo: _currentPadMode == KeyPadMode.yesNo,
                  proposedAnswer: _proposedAnswer,
                  isDark: isDark,
                ),

                if (isLandscape) const SizedBox(height: 12) else const Spacer(),

                // Input Method
                Padding(
                  padding: EdgeInsets.all(isLandscape ? 12.0 : 24.0),
                  child: Center(
                    child: SizedBox(
                      width: isLandscape ? 400 : double.infinity,
                      child: _buildInputWidget(isDark),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            );

            if (isLandscape) {
              return SingleChildScrollView(child: content);
            }
            return content;
          },
        ),
      ),
      bottomNavigationBar: AdsBanner.buildBottomBar(ref),
    );
  }

  Widget _buildInputWidget(bool isDark) {
    switch (_currentPadMode) {
      case KeyPadMode.multipleChoice:
        return MultipleChoicePad(
          choices: _currentQuestion.choices.map((c) => '$c').toList(),
          correctIndex: _currentQuestion.choices.indexOf(
            _currentQuestion.answer,
          ),
          selectedIndex: _selectedAnswer != null
              ? _currentQuestion.choices.indexOf(_selectedAnswer!)
              : null,
          answered: _answered,
          onChoiceSelected: (index) =>
              _onAnswerSubmitted(_currentQuestion.choices[index]),
          isDark: isDark,
        );
      case KeyPadMode.numPad:
        return NumericKeyPad(
          currentInput: _numInput,
          onInputChanged: (val) {
            if (_answered) return;
            setState(() {
              _numInput = val;
            });
          },
          onSubmit: () {
            if (_answered || _numInput.isEmpty) return;
            final numVal = num.tryParse(_numInput);
            if (numVal != null) {
              _onAnswerSubmitted(numVal);
            }
          },
          themeColor: widget.themeColor,
          isDark: isDark,
        );
      case KeyPadMode.yesNo:
        return YesNoPad(
          answered: _answered,
          userAnswerCorrect: _userAnswerCorrect,
          selectedYes: _selectedYes,
          onAnswer: _onYesNoAnswered,
          isDark: isDark,
        );
    }
  }

  Widget _buildFinishedScreen(ShadThemeData theme, dynamic l10n, bool isDark) {
    int stars = 0;
    if (_correctAnswers == 5) {
      stars = 3;
    } else if (_correctAnswers >= 4) {
      stars = 2;
    } else if (_correctAnswers >= 3) {
      stars = 1;
    }

    final isNextAvailable = stars > 0 && widget.level < 50;
    final actionLabel = isNextAvailable
        ? l10n.math_tricks.training.nextLevel
        : l10n.math_tricks.training.retry;

    return TrainingFinishedView(
      correctAnswers: _correctAnswers,
      wrongAnswers: _wrongAnswers,
      secondsElapsed: _secondsElapsed,
      totalQuestions: _totalQuestions,
      themeColor: widget.themeColor,
      onMainMenu: () {
        Navigator.of(context).pop(); // Back to level selection
      },
      actionLabel: actionLabel,
      onAction: () {
        Navigator.of(context).pop(); // Exit current training
        if (isNextAvailable) {
          // Go to next level
          TricksTrainingScreen.navigate(
            context,
            chapterKey: widget.chapterKey,
            trickTitle: widget.trickTitle,
            level: widget.level + 1,
            themeColor: widget.themeColor,
            onComplete: widget.onComplete,
            initialKeyPadMode: _currentPadMode,
          );
        } else {
          // Repeat current level
          TricksTrainingScreen.navigate(
            context,
            chapterKey: widget.chapterKey,
            trickTitle: widget.trickTitle,
            level: widget.level,
            themeColor: widget.themeColor,
            onComplete: widget.onComplete,
            initialKeyPadMode: _currentPadMode,
          );
        }
      },
    );
  }
}
