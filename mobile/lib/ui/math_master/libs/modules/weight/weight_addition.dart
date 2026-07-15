import '../../solver/measurement_lib.dart';
import '../length/length_addition.dart';

class WeightAddition extends LengthAddition {
  @override
  void initLibrary() {
    measurementLib = MeasurementLib.initWeight();
  }

  WeightAddition.init(super.chapter, super.mdChapter) : super.init();
}
