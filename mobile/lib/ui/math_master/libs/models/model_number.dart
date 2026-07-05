class ModelNumber {
  num min;
  num max;
  num spacing;

  // numerator
  int minNum;
  int maxNum;
  int spacingNum;

  // denominator
  int minDen;
  int maxDen;
  int spacingDen;

  ModelNumber({
    this.min = 0,
    this.max = 0,
    this.spacing = 1,
    this.minNum = 0,
    this.maxNum = 0,
    this.spacingNum = 1,
    this.minDen = 1,
    this.maxDen = 1,
    this.spacingDen = 1,
  });

  void clone(ModelNumber m) {
    min = m.min;
    max = m.max;
    spacing = m.spacing;

    minNum = m.minNum;
    maxNum = m.maxNum;
    spacingNum = m.spacingNum;

    minDen = m.minDen;
    maxDen = m.maxDen;
    spacingDen = m.spacingDen;
  }

  num getMin() {
    return (min);
  }

  num getSpacing() {
    return (spacing);
  }

  num getMax() {
    return (max);
  }

  int getMinI() {
    return (min.toInt());
  }

  int getMaxI() {
    return (max.toInt());
  }

  int getSpacingI() {
    return (spacing.toInt());
  }

  double getSpacingD() {
    return (spacing.toDouble());
  }

  double getMinD() {
    return (min.toDouble());
  }

  double getMaxD() {
    return (max.toDouble());
  }

  int getMinNum() {
    return (minNum);
  }

  int getSpacingNum() {
    return (spacingNum);
  }

  int getMaxNum() {
    return (maxNum);
  }

  int getMinDen() {
    return (minDen);
  }

  int getSpacingDen() {
    return (spacingDen);
  }

  int getMaxDen() {
    return (maxDen);
  }
}
