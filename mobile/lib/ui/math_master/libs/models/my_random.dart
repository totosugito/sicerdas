import 'dart:math';
import 'enums.dart';

class MyRandom {
  final Random rdm = Random();

  MyRandom();

  double nextDouble() {
    return (rdm.nextDouble());
  }

  int nextInt({
    RandomMode mode = RandomMode.range,
    int min = 0,
    int spacing = 1,
    int max = 1,
  }) {
    if (min == max) {
      return (min);
    }

    int mmin = min ~/ spacing;
    int mmax = max ~/ spacing;
    int v;
    switch (mode) {
      case RandomMode.max:
        v = rdm.nextInt(mmax);
        break;
      case RandomMode.range:
        v = mmin.toInt() + rdm.nextInt((mmax - mmin).abs());
        break;
      default:
        v = rdm.nextInt(1 << 32);
        break;
    }
    v = v * spacing;
    return (v);
  }

  int nextSign() {
    return (rdm.nextBool() ? 1 : -1);
  }

  bool nextBool() {
    return (rdm.nextBool());
  }

  int getNumberRankTh(num v) {
    if (v.toInt() == 0) {
      return (0);
    }

    v = v.abs();
    int rank = 0;
    while ((v % 10) == 0) {
      v = v / 10;
      rank += 1;
    }
    return (rank);
  }
}
