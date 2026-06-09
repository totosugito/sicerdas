import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/auth/auth_notifier.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';

class SignUpScreen extends ConsumerStatefulWidget {
  const SignUpScreen({super.key});

  @override
  ConsumerState<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends ConsumerState<SignUpScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignUp() async {
    final l10n = AppLocalizations.of(context)!;
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    // Manual Validation
    if (name.isEmpty) {
      setState(() => _errorMessage = l10n.errorNameRequired);
      return;
    }
    if (email.isEmpty) {
      setState(() => _errorMessage = l10n.errorEmailRequired);
      return;
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(email)) {
      setState(() => _errorMessage = l10n.errorEmailInvalid);
      return;
    }
    if (password.isEmpty) {
      setState(() => _errorMessage = l10n.errorPasswordRequired);
      return;
    }
    if (password.length < 6) {
      setState(() => _errorMessage = l10n.errorPasswordLength);
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final success = await ref
          .read(authStateProvider.notifier)
          .signUpWithEmail(name, email, password);

      if (success && mounted) {
        setState(() {
          _successMessage = l10n.signUpSuccessMessage;
        });
        // Auto-navigate back to Login after a short delay
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) Navigator.pop(context);
        });
      } else if (mounted) {
        setState(() {
          _errorMessage = l10n.errorGeneric;
        });
      }
    } catch (e) {
      if (mounted) {
        String msg = e.toString().replaceAll('Exception: ', '');
        if (e is DioException) {
          final responseData = e.response?.data;
          if (responseData is Map && responseData['message'] != null) {
            msg = responseData['message'].toString();
          }
        }
        setState(() {
          _errorMessage = msg;
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: theme.colorScheme.foreground),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 16),
              // Header / logo
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: theme.colorScheme.primary.withValues(alpha: 0.3),
                    width: 1.5,
                  ),
                ),
                child: Image.asset(
                  'assets/images/sicerdas-transparent-v1.png',
                  height: 56,
                  width: 56,
                  errorBuilder: (context, error, stackTrace) {
                    return Icon(
                      Icons.person_add_outlined,
                      size: 56,
                      color: theme.colorScheme.primary,
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),

              // Title & Subtitle
              Text(
                l10n.signUpTitle,
                style: theme.textTheme.h2.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                l10n.signUpSubtitle,
                style: theme.textTheme.muted,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // Error message banner
              if (_errorMessage != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.destructive.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: theme.colorScheme.destructive.withValues(
                        alpha: 0.2,
                      ),
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.error_outline_rounded,
                        color: theme.colorScheme.destructive,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: TextStyle(
                            color: theme.colorScheme.destructive,
                            fontWeight: FontWeight.w500,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Success message banner
              if (_successMessage != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.green.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.check_circle_outline_rounded,
                        color: Colors.green,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _successMessage!,
                          style: const TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.w500,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Input Full Name
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.nameLabel,
                    style: theme.textTheme.small.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.foreground,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ShadInput(
                    controller: _nameController,
                    placeholder: Text(l10n.nameLabel),
                    keyboardType: TextInputType.name,
                    leading: Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: Icon(
                        Icons.person_outline_rounded,
                        size: 18,
                        color: theme.colorScheme.mutedForeground,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Input Email
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.emailLabel,
                    style: theme.textTheme.small.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.foreground,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ShadInput(
                    controller: _emailController,
                    placeholder: Text(l10n.emailLabel),
                    keyboardType: TextInputType.emailAddress,
                    leading: Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: Icon(
                        Icons.mail_outline_rounded,
                        size: 18,
                        color: theme.colorScheme.mutedForeground,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Input Password
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.passwordLabel,
                    style: theme.textTheme.small.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.foreground,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ShadInput(
                    controller: _passwordController,
                    placeholder: Text(l10n.passwordLabel),
                    obscureText: _obscurePassword,
                    leading: Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: Icon(
                        Icons.lock_outline_rounded,
                        size: 18,
                        color: theme.colorScheme.mutedForeground,
                      ),
                    ),
                    trailing: GestureDetector(
                      onTap: () =>
                          setState(() => _obscurePassword = !_obscurePassword),
                      child: Icon(
                        _obscurePassword
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        size: 18,
                        color: theme.colorScheme.mutedForeground,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Register Button
              ShadButton(
                width: double.infinity,
                height: 48,
                onPressed: _isLoading ? null : _handleSignUp,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white,
                          ),
                        ),
                      )
                    : Text(l10n.signUpButton),
              ),

              const SizedBox(height: 32),

              // Switch to Sign In screen
              GestureDetector(
                onTap: () {
                  Navigator.pop(context);
                },
                child: RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    style: theme.textTheme.muted.copyWith(
                      color: theme.colorScheme.mutedForeground,
                      fontSize: 14,
                    ),
                    children: [
                      TextSpan(
                        text: "${l10n.alreadyHaveAccount.split('?').first}? ",
                      ),
                      TextSpan(
                        text: l10n.alreadyHaveAccount.split('?').last.trim(),
                        style: TextStyle(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
