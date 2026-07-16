import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/core/auth/auth_service.dart';
import 'package:bse/core/utils/toast_utils.dart';

class ChangePasswordForm extends ConsumerStatefulWidget {
  const ChangePasswordForm({super.key});

  @override
  ConsumerState<ChangePasswordForm> createState() => _ChangePasswordFormState();
}

class _ChangePasswordFormState extends ConsumerState<ChangePasswordForm> {
  final _passwordFormKey = GlobalKey<FormState>();

  late final TextEditingController _currentPasswordController;
  late final TextEditingController _newPasswordController;
  late final TextEditingController _confirmPasswordController;

  bool _isSavingPassword = false;

  bool _obscureCurrentPassword = true;
  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void initState() {
    super.initState();
    _currentPasswordController = TextEditingController();
    _newPasswordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
  }

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _changePassword() async {
    if (!(_passwordFormKey.currentState?.validate() ?? false)) return;

    final l10n = Translations.of(context);

    if (_newPasswordController.text != _confirmPasswordController.text) {
      ToastUtils.showError(
        context,
        title: l10n.common.error.title,
        message: l10n.profile.passwordMismatch,
      );
      return;
    }

    setState(() {
      _isSavingPassword = true;
    });

    final (success, message) = await ref
        .read(authServiceProvider)
        .changePassword(
          currentPassword: _currentPasswordController.text,
          newPassword: _newPasswordController.text,
        );

    setState(() {
      _isSavingPassword = false;
    });

    if (mounted) {
      if (success) {
        _currentPasswordController.clear();
        _newPasswordController.clear();
        _confirmPasswordController.clear();
        ToastUtils.showSuccess(
          context,
          title: l10n.common.successTitle,
          message: message,
        );
      } else {
        ToastUtils.showError(
          context,
          title: l10n.common.error.title,
          message: message,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);
    final theme = ShadTheme.of(context);

    return ShadCard(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _passwordFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.profile.security,
              style: theme.textTheme.large.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            // Current Password
            ShadInputFormField(
              label: Text(l10n.profile.currentPassword),
              controller: _currentPasswordController,
              placeholder: Text(
                l10n.profile.currentPasswordPlaceholder,
              ),
              obscureText: _obscureCurrentPassword,
              trailing: Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: InkWell(
                  onTap: () {
                    setState(() {
                      _obscureCurrentPassword =
                          !_obscureCurrentPassword;
                    });
                  },
                  child: Icon(
                    _obscureCurrentPassword
                        ? LucideIcons.eyeOff
                        : LucideIcons.eye,
                    size: 16,
                  ),
                ),
              ),
              validator: (v) {
                if (v.isEmpty) {
                  return l10n.profile.passwordRequirement;
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // New Password
            ShadInputFormField(
              label: Text(l10n.profile.newPassword),
              controller: _newPasswordController,
              placeholder: Text(l10n.profile.newPasswordPlaceholder),
              obscureText: _obscureNewPassword,
              trailing: Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: InkWell(
                  onTap: () {
                    setState(() {
                      _obscureNewPassword = !_obscureNewPassword;
                    });
                  },
                  child: Icon(
                    _obscureNewPassword
                        ? LucideIcons.eyeOff
                        : LucideIcons.eye,
                    size: 16,
                  ),
                ),
              ),
              validator: (v) {
                if (v.length < 6) {
                  return l10n.profile.passwordRequirement;
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Confirm Password
            ShadInputFormField(
              label: Text(l10n.profile.confirmPassword),
              controller: _confirmPasswordController,
              placeholder: Text(
                l10n.profile.confirmPasswordPlaceholder,
              ),
              obscureText: _obscureConfirmPassword,
              trailing: Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: InkWell(
                  onTap: () {
                    setState(() {
                      _obscureConfirmPassword =
                          !_obscureConfirmPassword;
                    });
                  },
                  child: Icon(
                    _obscureConfirmPassword
                        ? LucideIcons.eyeOff
                        : LucideIcons.eye,
                    size: 16,
                  ),
                ),
              ),
              validator: (v) {
                if (v.length < 6) {
                  return l10n.profile.passwordRequirement;
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Change Password Button
            SizedBox(
              width: double.infinity,
              child: ShadButton(
                onPressed: _isSavingPassword ? null : _changePassword,
                child: _isSavingPassword
                    ? Text(l10n.profile.saving)
                    : Text(l10n.profile.saveChanges),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
