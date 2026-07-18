import type {
  ElementData,
  ElementNote,
  NavigationData,
  ElementImages,
  AtomicProperties,
  AtomicIsotopeItem,
} from "backend/src/modules/periodic-table/index.ts";
import type { BaseResponse } from "backend/src/types/index.ts";

export type {
  ElementData,
  ElementNote,
  NavigationData,
  ElementImages,
  AtomicProperties,
  AtomicIsotopeItem,
};

export interface PeriodicElementResponse<T = ElementData> extends BaseResponse {
  data: T;
}
