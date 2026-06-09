import 'package:flutter/material.dart';

class SliverStickyHeaderDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  final double height;
  final Color backgroundColor;

  SliverStickyHeaderDelegate({
    required this.child,
    required this.height,
    required this.backgroundColor,
  });

  @override
  double get minExtent => height;

  @override
  double get maxExtent => height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Container(color: backgroundColor, child: child);
  }

  @override
  bool shouldRebuild(covariant SliverStickyHeaderDelegate oldDelegate) {
    return oldDelegate.child != child ||
        oldDelegate.height != height ||
        oldDelegate.backgroundColor != backgroundColor;
  }
}
