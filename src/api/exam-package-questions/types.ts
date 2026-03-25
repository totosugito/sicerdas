export interface AssignPackageQuestionsRequest {
  packageId: string;
  sectionId: string;
  questionIds: string[];
}

export interface UnassignPackageQuestionsRequest {
  packageId: string;
  questionIds: string[];
}

export interface SyncPackageQuestionsOrderRequest {
  packageId: string;
  sectionId: string;
  questionIds: string[];
}

export interface CommonResponse {
  success: boolean;
  message: string;
}

import { PaginationData } from "@/components/custom/table";

export interface ListPackageQuestionsRequest {
  packageId: string;
  sectionId?: string;
  page?: number;
  limit?: number;
}

export interface PackageQuestionItem {
  packageId: string;
  sectionId: string | null;
  questionId: string;
  order: number;
  question: {
    id: string;
    content: any[];
    type: string;
    difficulty: string;
    subjectName: string | null;
  };
  section?: {
    id: string;
    title: string;
  };
}

export interface ListPackageQuestionsResponse extends CommonResponse {
  data: {
    items: PackageQuestionItem[];
    meta: PaginationData;
  };
}
