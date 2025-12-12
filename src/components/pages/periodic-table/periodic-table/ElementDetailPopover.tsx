import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PeriodicCell } from "./PeriodicCell";
import { usePeriodicElementQuery } from "@/service/periodic-table-api";
import { PeriodicElement as PeriodicElementType } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";

interface ElementDetailPopoverProps {
  element: PeriodicElementType;
  children: React.ReactNode;
  theme?: string;
}

export function ElementDetailPopover({ element, children, theme = 'theme1' }: ElementDetailPopoverProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // Only fetch data when popover is open
  const { data, isLoading, isError, error } = usePeriodicElementQuery({ 
    atomicNumber: element.atomicNumber, 
    locale: i18n.language 
  }, {
    enabled: isOpen // Only run the query when the popover is open
  });

  const handleViewDetails = () => {
    navigate({ 
      to: AppRoute.periodicTable.elementDetail.url, 
      params: { atomicNumber: element.atomicNumber.toString() } 
    });
  };

  const renderProperty = (label: string, value: string | number | undefined) => {
    if (!value) return null;
    return (
      <div className="flex justify-between py-1 border-b border-border last:border-0">
        <span className="font-medium text-muted-foreground">{label}:</span>
        <span className="text-right max-w-[60%] break-words">{String(value)}</span>
      </div>
    );
  };

  const renderOverview = (overview: string | undefined) => {
    if (!overview) return null;
    return (
      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: overview }} />
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer">
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] max-h-[80vh] overflow-y-auto p-0" 
        align="center"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isLoading ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : isError ? (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || t('periodicTable.elementDetail.errorLoading')}
            </AlertDescription>
          </Alert>
        ) : data ? (
          <div className="p-4">
            {/* Header with element cell and basic info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-18 h-18 flex items-center justify-center">
                  <PeriodicCell
                    element={{
                      atomicId: data.atomicId,
                      idx: data.idx,
                      idy: data.idy,
                      atomicNumber: data.atomicNumber,
                      atomicGroup: data.atomicGroup,
                      atomicName: data.atomicName,
                      atomicSymbol: data.atomicSymbol
                    }}
                    cellSize={72}
                    theme={theme}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{data.atomicName}</h3>
                  <p className="text-muted-foreground">{data.atomicSymbol} - {t('periodicTable.periodicTable.var.atomicNumber')} {data.atomicNumber}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                ×
              </Button>
            </div>

            {/* Key Properties */}
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                {t('periodicTable.periodicTable.elementDetail.overview')}
              </h4>
              <div className="space-y-1 text-sm">
                {renderProperty(t('periodicTable.periodicTable.var.atomicWeight'), data.atomicProperties?.atomicWeight as string | undefined)}
                {renderProperty(t('periodicTable.periodicTable.var.phase'), data.atomicProperties?.phase as string | undefined)}
                {renderProperty(t('periodicTable.periodicTable.var.group'), data.atomicProperties?.group as string | undefined)}
                {renderProperty(t('periodicTable.periodicTable.var.period'), data.atomicProperties?.period as string | undefined)}
                {renderProperty(t('periodicTable.periodicTable.var.block'), data.atomicProperties?.block as string | undefined)}
                {renderProperty(t('periodicTable.periodicTable.var.series'), data.atomicProperties?.series as string | undefined)}
                {renderProperty(t('periodicTable.periodicTable.var.color'), data.atomicProperties?.color as string | undefined)}
                {renderProperty(t('periodicTable.periodicTable.var.electronConfiguration'), data.atomicProperties?.electronConfiguration as string | undefined)}
              </div>
            </div>

            {/* Details Button */}
            <div className="flex justify-end">
              <Button onClick={handleViewDetails}>
                {t('periodicTable.periodicTable.elementDetail.viewDetails')}
              </Button>
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}