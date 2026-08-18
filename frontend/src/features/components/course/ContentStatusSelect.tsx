import { useAppTranslation } from "@/lib/i18n-typed";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectPositioner,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { EnumContentStatus } from "@/api/types";

interface ContentStatusSelectProps {
  value?: string;
  onValueChange: (status: string | undefined) => void;
  disabled?: boolean;
}

export const ContentStatusSelect = ({ value, onValueChange, disabled }: ContentStatusSelectProps) => {
  const { t } = useAppTranslation();

  return (
    <Select
      value={value || "all"}
      onValueChange={(val) => {
        const newStatus = !val || val === "all" ? undefined : val;
        onValueChange(newStatus);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px] flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <SelectValue
          placeholder={t(($) => $.course.courses.table.columns.status)}
          render={(_, { value }) => {
            const label =
              !value || value === "all"
                ? t(($) => $.course.lectureTexts.table.statusFilter)
                : t(
                  ($) =>
                    $.labels.statusValues[
                    value as keyof typeof $.labels.statusValues
                    ]
                ) || value;
            return <span className="text-left truncate block w-full">{label}</span>;
          }}
        />
      </SelectTrigger>
      <SelectPositioner>
        <SelectContent>
          <SelectItem value="all">
            {t(($) => $.course.lectureTexts.table.statusFilter)}
          </SelectItem>
          {Object.values(EnumContentStatus).map((st) => (
            <SelectItem key={st} value={st}>
              {t(($) => $.labels.statusValues[st as keyof typeof $.labels.statusValues]) || st}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPositioner>
    </Select>
  );
};
