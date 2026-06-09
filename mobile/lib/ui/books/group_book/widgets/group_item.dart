import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/widgets/new_badge.dart';
import '../../libs/providers/books_provider.dart';
import '../../group_detail/group_detail_screen.dart';

class GroupItem extends StatelessWidget {
  final BookGroupWithMetadata group;
  final Color color;

  const GroupItem({super.key, required this.group, required this.color});

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isNew = group.isNew;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => GroupDetailScreen(group: group.group),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : Colors.grey.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.05)
                  : Colors.black.withValues(alpha: 0.05),
              width: 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 48,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.8),
                  borderRadius: const BorderRadius.horizontal(
                    right: Radius.circular(2),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text.rich(
                      TextSpan(
                        children: [
                          if (isNew) ...[
                            const WidgetSpan(
                              alignment: PlaceholderAlignment.middle,
                              child: NewBadge(),
                            ),
                          ],
                          TextSpan(
                            text: group.group.name,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                margin: const EdgeInsets.only(right: 8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: color.withValues(alpha: 0.2)),
                ),
                child: Text(
                  '${group.group.bookTotal ?? 0}',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: color,
                  ),
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                size: 18,
                color: theme.textTheme.muted.color?.withValues(alpha: 0.5),
              ),
              const SizedBox(width: 8),
            ],
          ),
        ),
      ),
    );
  }
}
