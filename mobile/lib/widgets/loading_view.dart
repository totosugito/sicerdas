import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class LoadingView extends StatefulWidget {
  final String? message;
  final String? title;
  final String? description;
  final double size;
  final IconData? icon;

  const LoadingView({
    super.key,
    this.message,
    this.title,
    this.description,
    this.size = 50,
    this.icon,
  });

  @override
  State<LoadingView> createState() => _LoadingViewState();
}

class _LoadingViewState extends State<LoadingView>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final primaryColor = theme.colorScheme.primary;

    return Center(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Stack(
                alignment: Alignment.center,
                children: [
                  RotationTransition(
                    turns: _controller,
                    child: ShaderMask(
                      shaderCallback: (rect) {
                        return SweepGradient(
                          colors: [
                            primaryColor.withValues(alpha: 0.1),
                            primaryColor,
                          ],
                          stops: const [0.0, 1.0],
                        ).createShader(rect);
                      },
                      child: Container(
                        width: widget.size,
                        height: widget.size,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3.5),
                        ),
                      ),
                    ),
                  ),
                  Icon(
                    widget.icon ?? Icons.sync_rounded,
                    size: widget.size * 0.45,
                    color: primaryColor,
                  ),
                ],
              ),
              if (widget.title != null && widget.title!.isNotEmpty) ...[
                const SizedBox(height: 24),
                Text(
                  widget.title!,
                  style: theme.textTheme.large.copyWith(
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
              if (widget.description != null &&
                  widget.description!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  widget.description!,
                  style: theme.textTheme.muted.copyWith(fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ],
              if (widget.message != null && widget.message!.isNotEmpty) ...[
                const SizedBox(height: 20),
                Text(
                  widget.message!,
                  style: theme.textTheme.muted.copyWith(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 0.2,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
