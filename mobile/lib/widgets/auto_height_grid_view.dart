import 'package:flutter/material.dart';

/// https://pub.dev/packages/auto_height_grid_view 1.0.0
/// Grid View with auto aspect ratio [dynamic height]
///
/// Usage is almost same as [GridView.count]
class AutoHeightGridView extends StatelessWidget {
  final IndexedWidgetBuilder builder;
  final int itemCount;
  final int crossAxisCount;
  final double crossAxisSpacing;
  final double mainAxisSpacing;
  final CrossAxisAlignment rowCrossAxisAlignment;
  final EdgeInsets? padding;
  final ScrollPhysics? physics;
  final ScrollController? controller;
  final bool shrinkWrap;

  const AutoHeightGridView({
    super.key,
    required this.itemCount,
    this.crossAxisCount = 2,
    this.crossAxisSpacing = 0,
    this.mainAxisSpacing = 0,
    this.rowCrossAxisAlignment = CrossAxisAlignment.start,
    this.controller,
    this.shrinkWrap = false,
    this.physics = const BouncingScrollPhysics(),
    this.padding = const EdgeInsets.all(5),
    required this.builder,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: controller,
      shrinkWrap: shrinkWrap,
      physics: physics,
      padding: padding,
      itemBuilder: (ctx, columnIndex) {
        return GridRow(
          columnIndex: columnIndex,
          builder: builder,
          itemCount: itemCount,
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: crossAxisSpacing,
          mainAxisSpacing: mainAxisSpacing,
          crossAxisAlignment: rowCrossAxisAlignment,
        );
      },
      itemCount: _columnLength(),
    );
  }

  int _columnLength() {
    if (itemCount % crossAxisCount == 0) {
      return itemCount ~/ crossAxisCount;
    } else {
      return (itemCount ~/ crossAxisCount) + 1;
    }
  }
}

class GridRow extends StatelessWidget {
  final IndexedWidgetBuilder builder;
  final int itemCount;
  final int crossAxisCount;
  final double crossAxisSpacing;
  final double mainAxisSpacing;
  final CrossAxisAlignment crossAxisAlignment;
  final int columnIndex;

  const GridRow({
    super.key,
    required this.columnIndex,
    required this.builder,
    required this.itemCount,
    required this.crossAxisCount,
    required this.crossAxisSpacing,
    required this.mainAxisSpacing,
    required this.crossAxisAlignment,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(top: (columnIndex == 0) ? 0 : mainAxisSpacing),
      child: Row(
        crossAxisAlignment: crossAxisAlignment,
        children: List.generate((crossAxisCount * 2) - 1, (rowIndex) {
          final rowNum = rowIndex + 1;
          if (rowNum % 2 == 0) {
            return SizedBox(width: crossAxisSpacing);
          }
          final rowItemIndex = ((rowNum + 1) ~/ 2) - 1;
          final itemIndex = (columnIndex * crossAxisCount) + rowItemIndex;
          if (itemIndex > itemCount - 1) {
            return const Expanded(child: SizedBox());
          }
          return Expanded(child: builder(context, itemIndex));
        }),
      ),
    );
  }
}
