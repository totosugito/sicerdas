import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:bse/core/database/database.dart';
import 'periodic_cell.dart';
import 'periodic_table_legend.dart';

class PeriodicTableLayout extends StatefulWidget {
  final List<PeriodicElement> elements;
  final String searchQuery;
  final String theme;
  final Function(PeriodicElement) onElementTap;
  final double minCellSize;

  const PeriodicTableLayout({
    super.key,
    required this.elements,
    required this.searchQuery,
    required this.theme,
    required this.onElementTap,
    this.minCellSize = 58.0,
  });

  @override
  State<PeriodicTableLayout> createState() => _PeriodicTableLayoutState();
}

class _PeriodicTableLayoutState extends State<PeriodicTableLayout> {
  late final ScrollController _verticalBodyController;
  late final ScrollController _verticalHeaderController;
  late final ScrollController _horizontalBodyController;
  late final ScrollController _horizontalHeaderController;

  @override
  void initState() {
    super.initState();
    _verticalBodyController = ScrollController();
    _verticalHeaderController = ScrollController();
    _horizontalBodyController = ScrollController();
    _horizontalHeaderController = ScrollController();

    _verticalBodyController.addListener(_syncVerticalScroll);
    _horizontalBodyController.addListener(_syncHorizontalScroll);
  }

  @override
  void dispose() {
    _verticalBodyController.removeListener(_syncVerticalScroll);
    _horizontalBodyController.removeListener(_syncHorizontalScroll);
    _verticalBodyController.dispose();
    _verticalHeaderController.dispose();
    _horizontalBodyController.dispose();
    _horizontalHeaderController.dispose();
    super.dispose();
  }

  void _syncVerticalScroll() {
    if (_verticalHeaderController.hasClients &&
        _verticalHeaderController.offset != _verticalBodyController.offset) {
      _verticalHeaderController.jumpTo(_verticalBodyController.offset);
    }
  }

  void _syncHorizontalScroll() {
    final offset = _horizontalBodyController.offset;
    if (_horizontalHeaderController.hasClients &&
        _horizontalHeaderController.offset != offset) {
      _horizontalHeaderController.jumpTo(offset);
    }
  }

  double _getCellWidth(int x, double baseCellSize) =>
      x == 0 ? (baseCellSize / 2) + 4 : baseCellSize + 4;

  double _getCellHeight(int y, double baseCellSize) =>
      (y == 0 || y == 8) ? (baseCellSize / 2) + 4 : baseCellSize + 4;

  @override
  Widget build(BuildContext context) {
    const int numCols = 19;
    const int numRows = 11;
    const double rightScrollbarSpacer = 0.0;
    const double bottomScrollbarSpacer = 0.0;

    // Create a 2D grid structure to place elements by their idx (X) and idy (Y)
    final grid = List.generate(
      numRows,
      (_) => List<PeriodicElement?>.generate(numCols, (_) => null),
    );

    for (var el in widget.elements) {
      final x = el.idx;
      final y = el.idy;
      if (x >= 0 && x < numCols && y >= 0 && y < numRows) {
        grid[y][x] = el;
      }
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        // Calculate cell size dynamically based on available width and height constraints
        // Subtract spacers, paddings (16.0 total), and the extra 4px margin per cell:
        // Width offset: 16.0 (padding) + 4.0 (col 0 margin) + 18 * 4.0 (cols 1-18 margins) = 92.0
        // Height offset: 16.0 (padding) + 2 * 4.0 (rows 0 & 8 margins) + 9 * 4.0 (other rows margins) = 60.0
        final double widthBasedCellSize = (constraints.maxWidth - 92.0) / 18.5;
        final double heightBasedCellSize =
            (constraints.maxHeight - 60.0) / 10.0;

        // Take the minimum size that fits both width and height, but clamp to widget.minCellSize
        final double baseCellSize = math.max(
          widget.minCellSize,
          math.min(widthBasedCellSize, heightBasedCellSize),
        );

        return Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              // Top row: Corner cell (0,0) + Horizontal Scroll Header
              Row(
                children: [
                  SizedBox(
                    width: _getCellWidth(0, baseCellSize),
                    height: _getCellHeight(0, baseCellSize),
                    child: _buildCellWrapper(grid[0][0], 0, 0, baseCellSize),
                  ),
                  Expanded(
                    child: ScrollConfiguration(
                      behavior: ScrollConfiguration.of(
                        context,
                      ).copyWith(scrollbars: false),
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        controller: _horizontalHeaderController,
                        physics: const NeverScrollableScrollPhysics(),
                        child: Row(
                          children: [
                            for (int x = 1; x < numCols; x++)
                              SizedBox(
                                width: _getCellWidth(x, baseCellSize),
                                height: _getCellHeight(0, baseCellSize),
                                child: _buildCellWrapper(
                                  grid[0][x],
                                  x,
                                  0,
                                  baseCellSize,
                                ),
                              ),
                            const SizedBox(
                              width: rightScrollbarSpacer,
                            ), // spacer for vertical scrollbar
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              // Middle area: Vertical Scroll Header + Body (Scrollable)
              Expanded(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: _getCellWidth(0, baseCellSize),
                      child: ScrollConfiguration(
                        behavior: ScrollConfiguration.of(
                          context,
                        ).copyWith(scrollbars: false),
                        child: SingleChildScrollView(
                          scrollDirection: Axis.vertical,
                          controller: _verticalHeaderController,
                          physics: const NeverScrollableScrollPhysics(),
                          child: Column(
                            children: [
                              for (int y = 1; y < numRows; y++)
                                SizedBox(
                                  width: _getCellWidth(0, baseCellSize),
                                  height: _getCellHeight(y, baseCellSize),
                                  child: _buildCellWrapper(
                                    grid[y][0],
                                    0,
                                    y,
                                    baseCellSize,
                                  ),
                                ),
                              const SizedBox(
                                height: bottomScrollbarSpacer,
                              ), // spacer to match body height
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: ScrollConfiguration(
                        behavior: ScrollConfiguration.of(
                          context,
                        ).copyWith(scrollbars: false),
                        child: SingleChildScrollView(
                          scrollDirection: Axis.vertical,
                          controller: _verticalBodyController,
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            controller: _horizontalBodyController,
                            child: Stack(
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    for (int y = 1; y < numRows; y++)
                                      Row(
                                        children: [
                                          for (int x = 1; x < numCols; x++)
                                            SizedBox(
                                              width: _getCellWidth(
                                                x,
                                                baseCellSize,
                                              ),
                                              height: _getCellHeight(
                                                y,
                                                baseCellSize,
                                              ),
                                              child: _buildCellWrapper(
                                                grid[y][x],
                                                x,
                                                y,
                                                baseCellSize,
                                              ),
                                            ),
                                          const SizedBox(
                                            width: rightScrollbarSpacer,
                                          ), // spacer for vertical scrollbar
                                        ],
                                      ),
                                    const SizedBox(
                                      height: bottomScrollbarSpacer,
                                    ), // spacer for bottom horizontal scrollbar
                                  ],
                                ),
                                Positioned(
                                  left: 2 * (baseCellSize + 4),
                                  top: 0,
                                  width: 10 * (baseCellSize + 4),
                                  height: 3 * (baseCellSize + 4),
                                  child: Container(
                                    alignment: Alignment.bottomCenter,
                                    padding: const EdgeInsets.only(bottom: 8.0),
                                    child: PeriodicTableLegend(
                                      theme: widget.theme,
                                      baseCellSize: baseCellSize,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCellWrapper(
    PeriodicElement? element,
    int x,
    int y,
    double baseCellSize,
  ) {
    final isSearchActive = widget.searchQuery.isNotEmpty;
    bool isSearchMatch = false;

    if (element != null) {
      isSearchMatch =
          element.atomicName.toLowerCase().contains(widget.searchQuery) ||
          element.atomicSymbol.toLowerCase().contains(widget.searchQuery) ||
          element.atomicNumber.toString().contains(widget.searchQuery);
    }

    if (element == null) {
      final double width = _getCellWidth(x, baseCellSize);
      final double height = _getCellHeight(y, baseCellSize);
      return SizedBox(width: width, height: height);
    }

    return PeriodicCell(
      element: element,
      cellSize: baseCellSize,
      isSearchActive: isSearchActive,
      isSearchMatch: isSearchMatch,
      theme: widget.theme,
      onTap: element.atomicNumber > 0
          ? () => widget.onElementTap(element)
          : null,
    );
  }
}
