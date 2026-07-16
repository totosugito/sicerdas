import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';

class PdfSaveAsDialog extends StatefulWidget {
  final String initialName;
  final ValueChanged<String> onBrowseAndSave;
  final ValueChanged<String> onSaveLocal;

  const PdfSaveAsDialog({
    super.key,
    required this.initialName,
    required this.onBrowseAndSave,
    required this.onSaveLocal,
  });

  @override
  State<PdfSaveAsDialog> createState() => _PdfSaveAsDialogState();
}

class _PdfSaveAsDialogState extends State<PdfSaveAsDialog> {
  late TextEditingController _nameController;
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialName);
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  String _getFinalName() {
    var newName = _nameController.text.trim();
    if (!newName.toLowerCase().endsWith('.pdf')) {
      newName += '.pdf';
    }
    return newName;
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final t = Translations.of(context);

    return AlertDialog(
      backgroundColor: theme.colorScheme.card,
      title: Text(
        t.pdf_viewer.saveAsDialog.title,
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
                t.pdf_viewer.saveAsDialog.prompt,
                style: theme.textTheme.p.copyWith(
                  color: theme.colorScheme.mutedForeground,
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _nameController,
                autofocus: true,
                style: TextStyle(color: theme.colorScheme.foreground),
                decoration: InputDecoration(
                  hintText: t.pdf_viewer.saveAsDialog.hint,
                  hintStyle: TextStyle(
                    color: theme.colorScheme.mutedForeground,
                  ),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return t.pdf_viewer.saveAsDialog.errorEmpty;
                  }
                  return null;
                },
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
          child: Text(
            t.common.cancel,
            style: TextStyle(color: theme.colorScheme.mutedForeground),
          ),
        ),
        TextButton(
          onPressed: () {
            if (_formKey.currentState?.validate() ?? false) {
              Navigator.of(context).pop();
              widget.onBrowseAndSave(_getFinalName());
            }
          },
          child: Text(
            t.pdf_viewer.saveAsDialog.browseSave,
            style: TextStyle(
              color: theme.colorScheme.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        TextButton(
          onPressed: () {
            if (_formKey.currentState?.validate() ?? false) {
              Navigator.of(context).pop();
              widget.onSaveLocal(_getFinalName());
            }
          },
          child: Text(
            t.pdf_viewer.saveAsDialog.saveLocal,
            style: TextStyle(color: theme.colorScheme.primary),
          ),
        ),
      ],
    );
  }
}
