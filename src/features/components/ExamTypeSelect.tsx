import { useAppTranslation } from "@/lib/i18n-typed";
import { MultiSelect } from "@/components/ui/multi-select";
import { EnumExamType } from "@/api/exam/types";

interface ExamTypeSelectProps {
  value: string[];
  onValueChange: (examTypes: string[]) => void;
}

export const ExamTypeSelect = ({ value, onValueChange }: ExamTypeSelectProps) => {
  const { t } = useAppTranslation();

  return (
    <MultiSelect
      options={[
        {
          label: t(($) => $.exam.packages.form.examType.options.official),
          value: EnumExamType.OFFICIAL,
        },
        {
          label: t(($) => $.exam.packages.form.examType.options.custom_practice),
          value: EnumExamType.CUSTOM_PRACTICE,
        },
        {
          label: t(($) => $.exam.packages.form.examType.options.course_exam),
          value: EnumExamType.COURSE_EXAM,
        },
      ]}
      value={value}
      onValueChange={onValueChange}
      placeholder={t(($) => $.exam.packages.form.examType.label)}
      className="w-full sm:w-[180px]"
      showAsSimple
    />
  );
};
