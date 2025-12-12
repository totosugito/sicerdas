import { Atom } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PeriodicTableHeaderProps {
  totalElements: number;
}

export function PeriodicTableHeader({ totalElements }: PeriodicTableHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="text-center py-10">
      <div className="inline-flex items-center justify-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Atom className="h-7 w-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t('periodicTable.periodicTable.moduleName')}
        </h1>
      </div>
      {/* <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        {t('periodicTable.periodicTable.elementsCount', { count: totalElements })}
      </p> */}
    </header>
  );
}