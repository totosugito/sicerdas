import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/core/auth/auth_service.dart';
import 'package:bse/core/utils/toast_utils.dart';

class EditProfileForm extends ConsumerStatefulWidget {
  const EditProfileForm({super.key});

  @override
  ConsumerState<EditProfileForm> createState() => _EditProfileFormState();
}

class _EditProfileFormState extends ConsumerState<EditProfileForm> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _schoolController;
  late final TextEditingController _addressController;
  late final TextEditingController _bioController;

  String? _selectedEducationLevel;
  String? _selectedGrade;

  bool _isSavingProfile = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(currentUserProvider);

    _nameController = TextEditingController(text: user?.name);
    _phoneController = TextEditingController(text: user?.phone);
    _schoolController = TextEditingController(text: user?.school);
    _addressController = TextEditingController(text: user?.address);
    _bioController = TextEditingController(text: user?.bio);

    _selectedEducationLevel = user?.educationLevel;
    _selectedGrade = user?.grade;

    // Fetch latest user details in background to sync profile data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchLatestProfile();
    });
  }

  Future<void> _fetchLatestProfile() async {
    final user = await ref.read(authServiceProvider).fetchUserProfile();
    if (user != null && mounted) {
      setState(() {
        _nameController.text = user.name ?? '';
        _phoneController.text = user.phone ?? '';
        _schoolController.text = user.school ?? '';
        _addressController.text = user.address ?? '';
        _bioController.text = user.bio ?? '';
        _selectedEducationLevel = user.educationLevel;
        _selectedGrade = user.grade;
      });
      ref.read(currentUserProvider.notifier).update(user);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _schoolController.dispose();
    _addressController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() {
      _isSavingProfile = true;
    });

    final updatedUser = await ref
        .read(authServiceProvider)
        .updateProfile(
          name: _nameController.text.trim(),
          phone: _phoneController.text.trim(),
          school: _schoolController.text.trim(),
          address: _addressController.text.trim(),
          bio: _bioController.text.trim(),
          educationLevel: _selectedEducationLevel,
          grade: _selectedGrade,
        );

    setState(() {
      _isSavingProfile = false;
    });

    if (mounted) {
      final l10n = Translations.of(context);
      if (updatedUser != null) {
        ref.read(currentUserProvider.notifier).update(updatedUser);
        ToastUtils.showSuccess(
          context,
          title: l10n.common.successTitle,
          message: l10n.profile.updateSuccess,
        );
      } else {
        ToastUtils.showError(
          context,
          title: l10n.common.error.title,
          message: l10n.profile.updateError,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);
    final theme = ShadTheme.of(context);

    final educationLevels = {
      'paud': 'PAUD',
      'tk': 'TK',
      'sd': 'SD',
      'mi': 'MI',
      'smp': 'SMP',
      'mts': 'MTs',
      'sma': 'SMA',
      'smk': 'SMK',
      'stm': 'STM',
      'university': 'Universitas',
      'other': 'Lainnya',
    };

    final grades = {
      '0': 'Playgroup',
      '1': 'Kelas 1',
      '2': 'Kelas 2',
      '3': 'Kelas 3',
      '4': 'Kelas 4',
      '5': 'Kelas 5',
      '6': 'Kelas 6',
      '7': 'Kelas 7',
      '8': 'Kelas 8',
      '9': 'Kelas 9',
      '10': 'Kelas 10',
      '11': 'Kelas 11',
      '12': 'Kelas 12',
      'other': 'Lainnya',
    };

    return ShadCard(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.profile.editProfile,
              style: theme.textTheme.large.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            // Full Name
            ShadInputFormField(
              label: Text(l10n.profile.fullName),
              controller: _nameController,
              placeholder: Text(l10n.profile.fullNamePlaceholder),
              validator: (v) {
                if (v.trim().length < 2) {
                  return l10n.profile.fullNameError;
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Phone Number
            ShadInputFormField(
              label: Text(l10n.profile.phoneNumber),
              controller: _phoneController,
              placeholder: Text(l10n.profile.phoneNumberPlaceholder),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),

            // Education Level
            Text(
              l10n.profile.educationLevel,
              style: theme.textTheme.small.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 6),
            ShadSelect<String>(
              placeholder: Text(l10n.profile.educationLevelPlaceholder),
              initialValue: _selectedEducationLevel,
              onChanged: (v) {
                setState(() {
                  _selectedEducationLevel = v;
                });
              },
              options: educationLevels.entries
                  .map(
                    (e) => ShadOption(value: e.key, child: Text(e.value)),
                  )
                  .toList(),
              selectedOptionBuilder: (context, value) =>
                  Text(educationLevels[value] ?? value),
            ),
            const SizedBox(height: 16),

            // Grade
            Text(
              l10n.profile.grade,
              style: theme.textTheme.small.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 6),
            ShadSelect<String>(
              placeholder: Text(l10n.profile.gradePlaceholder),
              initialValue: _selectedGrade,
              onChanged: (v) {
                setState(() {
                  _selectedGrade = v;
                });
              },
              options: grades.entries
                  .map(
                    (e) => ShadOption(value: e.key, child: Text(e.value)),
                  )
                  .toList(),
              selectedOptionBuilder: (context, value) =>
                  Text(grades[value] ?? value),
            ),
            const SizedBox(height: 16),

            // School Name
            ShadInputFormField(
              label: Text(l10n.profile.school),
              controller: _schoolController,
              placeholder: Text(l10n.profile.schoolPlaceholder),
            ),
            const SizedBox(height: 16),

            // Address
            ShadInputFormField(
              label: Text(l10n.profile.address),
              controller: _addressController,
              placeholder: Text(l10n.profile.addressPlaceholder),
              maxLines: 2,
            ),
            const SizedBox(height: 16),

            // Bio
            ShadInputFormField(
              label: Text(l10n.profile.bio),
              controller: _bioController,
              placeholder: Text(l10n.profile.bioPlaceholder),
              maxLines: 3,
            ),
            const SizedBox(height: 24),

            // Save Button
            SizedBox(
              width: double.infinity,
              child: ShadButton(
                onPressed: _isSavingProfile ? null : _saveProfile,
                child: _isSavingProfile
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
