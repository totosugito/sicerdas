import '../../solver/measurement_lib.dart';
import '../length/length_conversion.dart';

class WeightConversion extends LengthConversion {
  @override
  void initLibrary() {
    measurementLib = MeasurementLib.initWeight();
  }

  WeightConversion.init(super.chapter, super.mdChapter) : super.init();
}
