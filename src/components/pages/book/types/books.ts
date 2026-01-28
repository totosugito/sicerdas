export const getGradeColor = (gradeName: string) => {
  if (gradeName.includes('SD')) return 'bg-red-500';
  if (gradeName.includes('SMP')) return 'bg-blue-500';
  if (gradeName.includes('SMA') || gradeName.includes('MA')) return 'bg-[#0089BD]';
  if (gradeName.includes('SMK')) return 'bg-[#0089BD]';
  if (gradeName.includes('Umum')) return 'bg-purple-500';
  return 'bg-emerald-500';
};

export const getGrade = (grade: string, prefix = '') => {
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  if (grades.includes(grade)) return `${prefix}${grade}`;
  return '';
}

export interface Book {
  id: number;
  title: string;
  description?: string;
  author?: string;
  publishedYear: string | number;
  totalPages: number;
  size: number;
  status: string;
  rating?: number;
  view?: number;
  favorite?: boolean;
  favoriteTotal?: number;
  category: {
    id: number;
    name: string;
  };
  group: {
    id: number;
    name: string;
    shortName?: string;
  };
  grade: {
    id: number;
    name: string;
    grade: string;
  };
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}