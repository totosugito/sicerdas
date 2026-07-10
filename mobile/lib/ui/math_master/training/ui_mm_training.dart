import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../libs/lib_math_master.dart';
import '../libs/models/enums.dart';
import '../libs/models/model_chapter.dart';
import '../libs/models/cl_mm_chapter.dart';
import '../libs/models/model_question.dart';
import '../libs/providers/math_master_repository.dart';
import '../../math_tricks/libs/widgets/multiple_choice_pad.dart';
import '../../math_tricks/libs/widgets/numeric_key_pad.dart';
import '../../math_tricks/libs/widgets/yes_no_pad.dart';
import '../ui/ui_mm_steps_solution.dart';
import '../../../widgets/confirmation_dialog.dart';
import 'widgets/training_finished_view.dart';
import 'widgets/training_question_card.dart';
import 'widgets/training_progress_header.dart';

class UiMmTraining extends ConsumerStatefulWidget {
  final ClMmChapter chapter;
  final ModelChapter mdChapter;
  final int timeLimitMode; // 0 = no limit, 1 = 1 min, 2 = 2 mins
  final int questionCount;
  final VoidCallback onComplete;

  const UiMmTraining({
    super.key,
    required this.chapter,
    required this.mdChapter,
    required this.timeLimitMode,
    required this.questionCount,
    required this.onComplete,
  });

  static void navigate({
    required BuildContext context,
    required ClMmChapter chapter,
    required ModelChapter mdChapter,
    required int timeLimitMode,
    required int questionCount,
    required VoidCallback onComplete,
  }) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => UiMmTraining(
          chapter: chapter,
          mdChapter: mdChapter,
          timeLimitMode: timeLimitMode,
          questionCount: questionCount,
          onComplete: onComplete,
        ),
      ),
    );
  }

  @override
  ConsumerState<UiMmTraining> createState() => _UiMmTrainingState();
}

class _UiMmTrainingState extends ConsumerState<UiMmTraining> {
  late LibMathMaster _libMathMaster;
  late ModelQuestion _currentQuestion;
  int _currentQuestionIndex = 0;
  int _correctAnswers = 0;
  int _wrongAnswers = 0;

  final List<bool?> _questionResults = [];

  // Timer
  late Timer _timer;
  int _secondsElapsed = 0;
  int _secondsRemaining = 0;
  bool _isTimeUp = false;

  // Question / Answer states
  bool _answered = false;
  num? _selectedAnswer;
  String _numInput = '';
  KeyPadMode _currentPadMode = KeyPadMode.pad4Pad;

  // Yes/No specifics
  bool? _selectedYes;
  bool? _userAnswerCorrect;

  bool _isFinished = false;

  @override
  void initState() {
    super.initState();
    _questionResults.addAll(List.filled(widget.questionCount, null));
    _libMathMaster = LibMathMaster.init(widget.chapter, widget.mdChapter);

    // Choose default keypad mode supported by chapter
    if (widget.mdChapter.pads.isNotEmpty) {
      _currentPadMode = widget.mdChapter.pads.first;
    }

    _generateNextQuestion();
    _startTimer();
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _startTimer() {
    if (widget.timeLimitMode > 0) {
      _secondsRemaining = widget.timeLimitMode * 60;
    }

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_isFinished) return;

      setState(() {
        _secondsElapsed++;
        if (widget.timeLimitMode > 0) {
          if (_secondsRemaining > 0) {
            _secondsRemaining--;
          } else {
            _isTimeUp = true;
            _finishTraining();
          }
        }
      });
    });
  }

  void _generateNextQuestion() {
    setState(() {
      _currentQuestion = _libMathMaster.newQuestion(
        padMode: _currentPadMode,
        resetData: true,
      );
      _answered = false;
      _selectedAnswer = null;
      _numInput = '';
      _selectedYes = null;
      _userAnswerCorrect = null;
    });
  }

  void _submitAnswer(num answer) {
    if (_answered) return;

    final correctChoice = _currentQuestion.choices.firstWhere(
      (c) => c.status,
      orElse: () => _currentQuestion.choices.first,
    );
    final correctVal = correctChoice.value.value;
    final isCorrect = answer == correctVal;

    setState(() {
      _answered = true;
      _selectedAnswer = answer;
      _questionResults[_currentQuestionIndex] = isCorrect;
      if (isCorrect) {
        _correctAnswers++;
      } else {
        _wrongAnswers++;
      }
    });

    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) {
        _onNextQuestion();
      }
    });
  }

  void _submitYesNo(bool choseYes) {
    if (_answered) return;

    final isUserCorrect = _currentQuestion.choicesBool[choseYes ? 1 : 0].status;

    setState(() {
      _answered = true;
      _selectedYes = choseYes;
      _userAnswerCorrect = isUserCorrect;
      _questionResults[_currentQuestionIndex] = isUserCorrect;
      if (isUserCorrect) {
        _correctAnswers++;
      } else {
        _wrongAnswers++;
      }
    });

    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) {
        _onNextQuestion();
      }
    });
  }

  void _onNextQuestion() {
    if (_currentQuestionIndex < widget.questionCount - 1) {
      setState(() {
        _currentQuestionIndex++;
        _generateNextQuestion();
      });
    } else {
      _finishTraining();
    }
  }

  Future<void> _finishTraining() async {
    setState(() {
      _isFinished = true;
    });
    _timer.cancel();

    // Save to repository
    final repo = ref.read(mathMasterRepositoryProvider);
    await repo.saveScore(
      chapterKey: widget.mdChapter.chapterKey,
      correctCount: _correctAnswers,
      wrongCount: _wrongAnswers,
      elapsedSeconds: _secondsElapsed,
    );

    widget.onComplete();
  }

  String _getFormattedTime() {
    if (widget.timeLimitMode > 0) {
      final minutes = _secondsRemaining ~/ 60;
      final seconds = _secondsRemaining % 60;
      return '$minutes:${seconds.toString().padLeft(2, '0')}';
    } else {
      final minutes = _secondsElapsed ~/ 60;
      final seconds = _secondsElapsed % 60;
      return '$minutes:${seconds.toString().padLeft(2, '0')}';
    }
  }

  void _changePadMode() {
    if (widget.mdChapter.pads.length <= 1) return;
    setState(() {
      final currentIndex = widget.mdChapter.pads.indexOf(_currentPadMode);
      final nextIndex = (currentIndex + 1) % widget.mdChapter.pads.length;
      _currentPadMode = widget.mdChapter.pads[nextIndex];

      _currentQuestion = _libMathMaster.newQuestion(
        padMode: _currentPadMode,
        resetData: false,
      );
    });
  }

  IconData _getPadModeIcon() {
    switch (_currentPadMode) {
      case KeyPadMode.pad4Pad:
        return Icons.grid_view_outlined;
      case KeyPadMode.padYesNo:
        return Icons.thumbs_up_down_outlined;
      case KeyPadMode.padNumPad:
        return Icons.keyboard_alt_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final locale = Translations.of(context).math_master;

    if (_isFinished || _isTimeUp) {
      return TrainingFinishedView(
        correctAnswers: _correctAnswers,
        wrongAnswers: _wrongAnswers,
        questionCount: widget.questionCount,
        chapterTitle: widget.mdChapter.title,
        onBackPressed: () => Navigator.pop(context, true),
      );
    }

    final String questionText = _currentQuestion.question;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _showExitDialog();
        if (shouldPop && context.mounted) {
          Navigator.pop(context);
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            widget.mdChapter.title,
            style: theme.textTheme.large.copyWith(
              fontWeight: FontWeight.w800,
              fontSize: 16,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          centerTitle: false,
          actions: [
            if (widget.mdChapter.hasSolution)
              IconButton(
                icon: const Icon(Icons.lightbulb_outline),
                onPressed: () {
                  final isUnanswered = !_answered;
                  if (isUnanswered) {
                    setState(() {
                      _answered = true;
                      _questionResults[_currentQuestionIndex] = false;
                      _wrongAnswers++;
                    });
                  }
                  _libMathMaster.updateSolution(
                    _currentQuestion,
                    solutionText: locale.solution_text,
                  );
                  UiMmStepsSolution.navigate(
                    context: context,
                    question: _currentQuestion,
                  ).then((_) {
                    if (isUnanswered && mounted) {
                      _onNextQuestion();
                    }
                  });
                },
              ),
            if (widget.mdChapter.pads.length > 1)
              IconButton(
                icon: Icon(_getPadModeIcon()),
                onPressed: _changePadMode,
              ),
          ],
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                TrainingProgressHeader(
                  currentQuestionIndex: _currentQuestionIndex,
                  totalQuestions: widget.questionCount,
                  correctAnswers: _correctAnswers,
                  wrongAnswers: _wrongAnswers,
                  formattedTime: _getFormattedTime(),
                  timeWarning:
                      widget.timeLimitMode > 0 && _secondsRemaining < 15,
                ),
                const SizedBox(height: 32),

                // Question Card
                TrainingQuestionCard(
                  question: questionText,
                  answered: _answered,
                  isCorrect: _questionResults[_currentQuestionIndex],
                ),

                const SizedBox(height: 24),

                // Input Keypad
                _buildKeypad(theme, isDark),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildKeypad(ShadThemeData theme, bool isDark) {
    if (_currentPadMode == KeyPadMode.pad4Pad) {
      final choices = _currentQuestion.choices
          .map((c) => c.value.value)
          .toList();
      final correctChoice = _currentQuestion.choices.firstWhere(
        (c) => c.status,
        orElse: () => _currentQuestion.choices.first,
      );
      return MultipleChoicePad(
        choices: choices,
        correctAnswer: correctChoice.value.value,
        selectedAnswer: _selectedAnswer,
        answered: _answered,
        onChoiceSelected: (val) => _submitAnswer(val),
        isDark: isDark,
      );
    } else if (_currentPadMode == KeyPadMode.padYesNo) {
      return YesNoPad(
        answered: _answered,
        userAnswerCorrect: _userAnswerCorrect,
        selectedYes: _selectedYes,
        onAnswer: (val) => _submitYesNo(val),
        isDark: isDark,
      );
    } else {
      return NumericKeyPad(
        currentInput: _numInput,
        onInputChanged: (val) {
          setState(() {
            _numInput = val;
          });
        },
        onSubmit: () {
          if (_numInput.isNotEmpty) {
            final doubleVal = double.tryParse(_numInput);
            if (doubleVal != null) {
              _submitAnswer(doubleVal);
            }
          }
        },
        themeColor: theme.colorScheme.primary,
        isDark: isDark,
      );
    }
  }

  Future<bool> _showExitDialog() async {
    final l10n = Translations.of(context);
    final result = await showShadDialog<bool>(
      context: context,
      builder: (context) => ConfirmationDialog(
        icon: LucideIcons.triangleAlert,
        title: l10n.math_tricks.training.exitTitle,
        description: l10n.math_tricks.training.exitDescription,
        confirmLabel: l10n.math_tricks.training.exitButton,
        cancelLabel: l10n.common.cancel,
        isDestructive: true,
        onConfirm: () => Navigator.of(context).pop(true),
      ),
    );
    return result ?? false;
  }
}
