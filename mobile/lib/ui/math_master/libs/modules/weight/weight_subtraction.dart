import '../../solver/measurement_lib.dart';
import '../length/length_subtraction.dart';

class WeightSubtraction extends LengthSubtraction {
  @override
  void initLibrary() {
    measurementLib = MeasurementLib.initWeight();
  }

  WeightSubtraction.init(super.chapter, super.mdChapter) : super.init();
}
