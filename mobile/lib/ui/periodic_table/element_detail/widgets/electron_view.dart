import 'package:flutter/material.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../libs/models/periodic_models.dart';

class ElectronView extends StatelessWidget {
  final AtomicProperties properties;
  final int atomicNumber;

  const ElectronView({
    super.key,
    required this.properties,
    required this.atomicNumber,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final electrons = properties.numberOfElectron ?? atomicNumber;
    final protons = atomicNumber;
    final neutrons = properties.numberOfNeutron ?? '-';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // --- Electrons ---
          _buildCard(
            label: l10n.electrons,
            value: '$electrons',
            gradient: LinearGradient(
              colors: isDark
                  ? [const Color(0xFFDC2626), const Color(0xFF991B1B)]
                  : [const Color(0xFFEF4444), const Color(0xFFB91C1C)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderColor: isDark
                ? const Color(0xFFEF4444).withValues(alpha: 0.3)
                : const Color(0xFFF87171).withValues(alpha: 0.3),
          ),
          const SizedBox(width: 12),

          // --- Protons ---
          _buildCard(
            label: l10n.protons,
            value: '$protons',
            gradient: LinearGradient(
              colors: isDark
                  ? [const Color(0xFF16A34A), const Color(0xFF166534)]
                  : [const Color(0xFF22C55E), const Color(0xFF15803D)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderColor: isDark
                ? const Color(0xFF22C55E).withValues(alpha: 0.3)
                : const Color(0xFF4ADE80).withValues(alpha: 0.3),
          ),
          const SizedBox(width: 12),

          // --- Neutrons ---
          _buildCard(
            label: l10n.neutrons,
            value: neutrons,
            gradient: LinearGradient(
              colors: isDark
                  ? [const Color(0xFF2563EB), const Color(0xFF1E40AF)]
                  : [const Color(0xFF3B82F6), const Color(0xFF1D4ED8)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderColor: isDark
                ? const Color(0xFF3B82F6).withValues(alpha: 0.3)
                : const Color(0xFF60A5FA).withValues(alpha: 0.3),
          ),
        ],
      ),
    );
  }

  Widget _buildCard({
    required String label,
    required String value,
    required Gradient gradient,
    required Color borderColor,
  }) {
    return Container(
      width: 80,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.9),
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
