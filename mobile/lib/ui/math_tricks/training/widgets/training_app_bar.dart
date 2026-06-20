import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/widgets/keypad_mode.dart';

class TrainingAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String trickTitle;
  final Color themeColor;
  final KeyPadMode currentPadMode;
  final String formattedTime;
  final bool showPadToggle;
  final VoidCallback onExitPressed;
  final VoidCallback onPadModeToggle;
  final VoidCallback onShowSolution;

  const TrainingAppBar({
    super.key,
    required this.trickTitle,
    required this.themeColor,
    required this.currentPadMode,
    required this.formattedTime,
    required this.showPadToggle,
    required this.onExitPressed,
    required this.onPadModeToggle,
    required this.onShowSolution,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);

    return AppBar(
      title: Text(
        trickTitle,
        style: theme.textTheme.large.copyWith(fontSize: 15),
      ),
      leading: IconButton(
        icon: const Icon(Icons.close_rounded),
        onPressed: onExitPressed,
      ),
      actions: [
        if (showPadToggle)
          IconButton(
            icon: Icon(
              currentPadMode == KeyPadMode.multipleChoice
                  ? Icons.calculate_outlined
                  : (currentPadMode == KeyPadMode.numPad
                        ? Icons.dialpad_outlined
                        : Icons.rule_rounded),
              color: themeColor,
            ),
            tooltip: currentPadMode == KeyPadMode.multipleChoice
                ? l10n.math_tricks.training.tooltipPadNum
                : (currentPadMode == KeyPadMode.numPad
                      ? l10n.math_tricks.training.tooltipPadYesNo
                      : l10n.math_tricks.training.tooltipPadMc),
            onPressed: onPadModeToggle,
          ),
        IconButton(
          icon: Icon(
            Icons.lightbulb_outline_rounded,
            color: themeColor,
          ),
          tooltip: l10n.math_tricks.training.tooltipSolution,
          onPressed: onShowSolution,
        ),
        Center(
          child: Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Row(
              children: [
                const Icon(Icons.timer_outlined, size: 16),
                const SizedBox(width: 4),
                Text(
                  formattedTime,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
