import 'package:flutter/material.dart';
import '../../../core/database/database.dart';
import 'periodic_cell.dart';

class PeriodicTableLayout extends StatelessWidget {
  final List<PeriodicElement> elements;
  final String searchQuery;
  final String theme;
  final Function(PeriodicElement) onElementTap;

  const PeriodicTableLayout({
    super.key,
    required this.elements,
    required this.searchQuery,
    required this.theme,
    required this.onElementTap,
  });

  @override
  Widget build(BuildContext context) {
    const int numCols = 18;
    const int numRows = 10;

    // Create a 2D grid structure to place elements by their idx (X) and idy (Y)
    // Coords: idx (1 to 18), idy (1 to 10)
    final grid = List.generate(
      numRows,
      (_) => List<PeriodicElement?>.generate(numCols, (_) => null),
    );

    for (var el in elements) {
      final x = el.idx - 1;
      final y = el.idy - 1;
      if (x >= 0 && x < numCols && y >= 0 && y < numRows) {
        grid[y][x] = el;
      }
    }

    return InteractiveViewer(
      maxScale: 2.5,
      minScale: 0.5,
      child: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (int y = 0; y < numRows; y++)
                  Row(
                    children: [
                      for (int x = 0; x < numCols; x++)
                        _buildCellWrapper(grid[y][x]),
                    ],
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCellWrapper(PeriodicElement? element) {
    final isSearchActive = searchQuery.isNotEmpty;
    bool isSearchMatch = false;

    if (element != null) {
      isSearchMatch = element.atomicName.toLowerCase().contains(searchQuery) ||
          element.atomicSymbol.toLowerCase().contains(searchQuery) ||
          element.atomicNumber.toString().contains(searchQuery);
    }

    return PeriodicCell(
      element: element,
      cellSize: 58,
      isSearchActive: isSearchActive,
      isSearchMatch: isSearchMatch,
      theme: theme,
      onTap: element != null && element.atomicNumber > 0
          ? () => onElementTap(element)
          : null,
    );
  }
}
