export type PackageFormValues = {
  title: string;
  categoryId: string;
  examType: string;
  durationMinutes: string;
  educationGradeId?: string | number | null;
  requiredTier?: string;
  description?: string;
  isActive: boolean;
  versionId?: string | number | null;
  thumbnail?: string | null;
  newThumbnailFile?: File | null;
};
