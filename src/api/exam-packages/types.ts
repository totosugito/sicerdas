export interface ExamPackage {
  id: string;
  categoryId: string;
  title: string;
  examType: string;
  durationMinutes: number;
  thumbnail: string | null;
  description: string | null;
  requiredTier: string | null;
  educationGradeId: number | null;
  categoryName: string | null;
  educationGradeName: string | null;
  isActive: boolean;
  isNew: boolean;
  versionId: number | null;
  totalSections: number;
  activeSections: number;
  totalQuestions: number;
  activeQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamPackageResponse {
  success: boolean;
  message: string;
}

export interface ExamPackageDetailResponse extends ExamPackageResponse {
  data: ExamPackage;
}
