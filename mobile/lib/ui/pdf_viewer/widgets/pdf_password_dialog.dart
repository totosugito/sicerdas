import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';

class PdfPasswordDialog extends StatefulWidget {
  final String errorText;
  final ValueChanged<String> onSubmit;
  final VoidCallback onCancel;

  const PdfPasswordDialog({
    super.key,
    required this.errorText,
    required this.onSubmit,
    required this.onCancel,
  });

  @override
  State<PdfPasswordDialog> createState() => _PdfPasswordDialogState();
}

class _PdfPasswordDialogState extends State<PdfPasswordDialog> {
  final TextEditingController _passwordController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  bool _passwordVisible = true;

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final t = Translations.of(context);

    return AlertDialog(
      backgroundColor: theme.colorScheme.card,
      title: Text(
        t.pdf_viewer.passwordDialog.title,
        style: theme.textTheme.large.copyWith(
          fontWeight: FontWeight.bold,
          color: theme.colorScheme.foreground,
        ),
      ),
      content: SizedBox(
        width: 320,
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                t.pdf_viewer.passwordDialog.prompt,
                style: theme.textTheme.p.copyWith(
                  color: theme.colorScheme.mutedForeground,
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                obscureText: _passwordVisible,
                autofocus: true,
                style: TextStyle(color: theme.colorScheme.foreground),
                decoration: InputDecoration(
                  hintText: t.pdf_viewer.passwordDialog.hint,
                  hintStyle: TextStyle(
                    color: theme.colorScheme.mutedForeground,
                  ),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _passwordVisible ? Icons.visibility : Icons.visibility_off,
                      color: theme.colorScheme.mutedForeground,
                    ),
                    onPressed: () {
                      setState(() {
                        _passwordVisible = !_passwordVisible;
                      });
                    },
                  ),
                ),
                validator: (value) {
                  if (widget.errorText.isNotEmpty) {
                    return widget.errorText;
                  }
                  if (value == null || value.isEmpty) {
                    return t.pdf_viewer.passwordDialog.errorEmpty;
                  }
                  return null;
                },
                onChanged: (value) {
                  if (widget.errorText.isNotEmpty) {
                    // Trigger validation to clear the error state
                    _formKey.currentState?.validate();
                  }
                },
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: widget.onCancel,
          child: Text(
            t.pdf_viewer.passwordDialog.cancel,
            style: TextStyle(color: theme.colorScheme.mutedForeground),
          ),
        ),
        TextButton(
          onPressed: () {
            if (_formKey.currentState?.validate() ?? false) {
              widget.onSubmit(_passwordController.text);
            }
          },
          child: Text(
            t.pdf_viewer.passwordDialog.open,
            style: TextStyle(color: theme.colorScheme.primary),
          ),
        ),
      ],
    );
  }
}
