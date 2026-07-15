class UnitMeasurement {
  final int id;
  final String symbol;
  final String label;
  final String toBase;
  final String fromBase;

  UnitMeasurement({
    required this.id,
    required this.symbol,
    required this.label,
    required this.toBase,
    required this.fromBase,
  });

  String getSymbol() {
    return symbol;
  }

  String getToBase() {
    return toBase;
  }

  String getFromBase() {
    return fromBase;
  }

  num toBaseValue() {
    return 0;
  }

  num fromBaseValue() {
    return 0;
  }
}
