import 'dart:async';
import 'dart:math' as math;
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
import '../../math_tricks/training/widgets/progress_dots.dart';
import 'ui_mm_steps_solution.dart';

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
  num? _proposedAnswer;
  final math.Random _random = math.Random();

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
      _currentQuestion = _libMathMaster.newQuestion(padMode: _currentPadMode, resetData: true);
      _answered = false;
      _selectedAnswer = null;
      _numInput = '';
      _selectedYes = null;
      _userAnswerCorrect = null;

      // Handle yes/no verification question
      if (_currentPadMode == KeyPadMode.padYesNo) {
        final bool showCorrect = _random.nextBool();
        final num correctVal = _libMathMaster.newQuestion(padMode: _currentPadMode, resetData: false).choices.firstWhere((c) => c.status).value.value;
        if (showCorrect) {
          _proposedAnswer = correctVal;
        } else {
          // distractor
          _proposedAnswer = correctVal + (_random.nextBool() ? 2 : -2);
        }
      }
    });
  }

  void _submitAnswer(num answer) {
    if (_answered) return;

    final correctChoice = _currentQuestion.choices.firstWhere((c) => c.status, orElse: () => _currentQuestion.choices.first);
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
  }

  void _submitYesNo(bool choseYes) {
    if (_answered) return;

    final correctChoice = _currentQuestion.choices.firstWhere((c) => c.status, orElse: () => _currentQuestion.choices.first);
    final correctVal = correctChoice.value.value;
    final isProposalCorrect = _proposedAnswer == correctVal;
    
    // User answered correctly if they chose Yes and the proposal is correct, OR chose No and the proposal is wrong
    final isUserCorrect = (choseYes == isProposalCorrect);

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

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final locale = Translations.of(context).math_master;
    final isDark = theme.brightness == Brightness.dark;

    if (_isFinished || _isTimeUp) {
      return _buildFinishedView(theme, locale);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.mdChapter.title),
        centerTitle: true,
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: ShadCard(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                backgroundColor: widget.timeLimitMode > 0 && _secondsRemaining < 15 
                    ? Colors.red.withValues(alpha: 0.2) 
                    : theme.colorScheme.muted,
                child: Text(
                  _getFormattedTime(),
                  style: theme.textTheme.large.copyWith(
                    fontWeight: FontWeight.bold,
                    color: widget.timeLimitMode > 0 && _secondsRemaining < 15 ? Colors.red : theme.colorScheme.foreground,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              // Progress indicators
              ProgressDots(
                totalQuestions: widget.questionCount,
                currentQuestionIndex: _currentQuestionIndex,
                questionResults: _questionResults,
                themeColor: theme.colorScheme.primary,
                isDark: isDark,
              ),
              const SizedBox(height: 32),
              
              // Question Card
              Expanded(
                child: Center(
                  child: ShadCard(
                    padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _currentPadMode == KeyPadMode.padYesNo
                              ? '${_currentQuestion.question.replaceAll('..', _proposedAnswer.toString())} ?'
                              : _currentQuestion.question,
                          style: theme.textTheme.h1.copyWith(
                            fontSize: 48,
                            fontWeight: FontWeight.w800,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        if (_answered) ...[
                          const SizedBox(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                _questionResults[_currentQuestionIndex] == true
                                    ? Icons.check_circle_rounded
                                    : Icons.cancel_rounded,
                                color: _questionResults[_currentQuestionIndex] == true ? Colors.green : Colors.red,
                                size: 32,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                _questionResults[_currentQuestionIndex] == true ? 'Benar!' : 'Salah!',
                                style: theme.textTheme.large.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: _questionResults[_currentQuestionIndex] == true ? Colors.green : Colors.red,
                                ),
                              ),
                            ],
                          ),
                        ]
                      ],
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Input Keypad
              if (!_answered) ...[
                _buildKeypad(theme, isDark),
              ] else ...[
                // Next / Solution actions
                Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (widget.mdChapter.hasSolution)
                      ShadButton.outline(
                        onPressed: () {
                          // Update solution HTML using Coordinator
                          _libMathMaster.updateSolution(_currentQuestion, solutionText: 'Solusi');
                          UiMmStepsSolution.navigate(
                            context: context,
                            question: _currentQuestion,
                          );
                        },
                        child: Text(locale.view_solution),
                      ),
                    const SizedBox(height: 12),
                    ShadButton(
                      onPressed: _onNextQuestion,
                      child: const Text('Lanjut'),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKeypad(ShadThemeData theme, bool isDark) {
    if (_currentPadMode == KeyPadMode.pad4Pad) {
      final choices = _currentQuestion.choices.map((c) => c.value.value).toList();
      final correctChoice = _currentQuestion.choices.firstWhere((c) => c.status, orElse: () => _currentQuestion.choices.first);
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
      return Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: theme.colorScheme.muted,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Jawaban:', style: theme.textTheme.large),
                Text(
                  _numInput.isEmpty ? '?' : _numInput,
                  style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          NumericKeyPad(
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
          ),
        ],
      );
    }
  }

  Widget _buildFinishedView(ShadThemeData theme, Translations$math_master$id locale) {
    final correctPercent = widget.questionCount > 0 ? (_correctAnswers / widget.questionCount) * 100 : 0.0;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Icon(Icons.emoji_events_rounded, color: theme.colorScheme.primary, size: 96),
              const SizedBox(height: 24),
              Text(
                'Latihan Selesai!',
                style: theme.textTheme.h1.copyWith(fontWeight: FontWeight.w800),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                widget.mdChapter.title,
                style: theme.textTheme.muted,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              
              // Scoring Summary Card
              ShadCard(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(locale.total_correct, style: theme.textTheme.large),
                        Text('$_correctAnswers', style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold, color: Colors.green)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(locale.total_wrong, style: theme.textTheme.large),
                        Text('$_wrongAnswers', style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold, color: Colors.red)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(locale.accuracy, style: theme.textTheme.large),
                        Text('${correctPercent.toStringAsFixed(0)}%', style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold, color: theme.colorScheme.primary)),
                      ],
                    ),
                  ],
                ),
              ),
              
              const Spacer(),
              
              ShadButton(
                size: ShadButtonSize.lg,
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Kembali ke Dashboard'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
