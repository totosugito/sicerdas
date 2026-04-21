export interface ExamPackage {
  id: string;
  title: string;
  examType: string;
  durationMinutes: number;
  thumbnail: string | null;
  description: string | null;
  requiredTier: string | null;
  isActive: boolean;
  isNew: boolean;
  versionId: number | null;
  category: {
    id: string;
    name: string | null;
    key: string | null;
  };
  grade: {
    id: number | null;
    name: string | null;
  };
  stats: {
    totalSections: number;
    activeSections: number;
    totalQuestions: number;
    activeQuestions: number;
    viewCount: number;
    likeCount: number;
    bookmarkCount: number;
    rating: number;
  };
  userInteraction?: {
    liked: boolean;
    disliked: boolean;
    rating: number;
    bookmarked: boolean;
    viewCount?: number;
  };
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

export interface GradeStats {
  id: number;
  name: string;
  stats: {
    activeCount: number;
    totalCount: number;
  };
}

export interface FilterParamsItem {
  id: string;
  name: string;
  key: string;
  description: string | null;
  grades: GradeStats[];
}

export interface ExamFilterParamsResponse extends ExamPackageResponse {
  data: FilterParamsItem[];
}
