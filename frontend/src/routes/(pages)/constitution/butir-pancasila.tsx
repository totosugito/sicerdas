import React, { useState, useMemo, useCallback } from "react";
import { useAppTranslation, getTranslationKey } from "@/lib/i18n-typed";
import { Trans } from "react-i18next";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search } from "lucide-react";
import butirPancasilaData from "@/data/constitution/butir_pancasila.json";
import {
  ConstitutionHero,
  ConstitutionSearchBar,
  highlightConstitutionText,
  matchesConstitutionQuery,
} from "@/features/constitution";

interface ButirItem {
  id: number;
  isi: string;
}

interface PancasilaItem {
  id: number;
  title: string;
  sila: string;
  image: string;
  data: ButirItem[];
}

interface VisiblePancasilaItem extends PancasilaItem {
  /** Total butir in this sila, regardless of the active search. */
  totalCount: number;
  /** Butir that actually match the search (0 when only the sila title matched). */
  matchedCount: number;
}

const PancasilaCard: React.FC<{
  sila: VisiblePancasilaItem;
  searchTerm: string;
  isExpanded: boolean;
}> = ({ sila, searchTerm, isExpanded }) => {
  const { t } = useAppTranslation();

  const isSearching = !!searchTerm.trim();
  const isAutoExpanded = isExpanded || isSearching;
  const silaLabel = t(($) => $.constitution.butirPancasila.sila);

  const countLabel =
    isSearching && sila.matchedCount > 0
      ? t(($) => $.constitution.butirPancasila.matchingButir, {
          matchingCount: sila.matchedCount,
          totalCount: sila.totalCount,
        })
      : t(($) => $.constitution.butirPancasila.butirPengamalanCount, {
          count: sila.totalCount,
        });

  return (
    <Card className="border-border bg-card shadow-xs overflow-hidden">
      <Accordion
        key={`sila-${sila.id}-${isAutoExpanded}`}
        multiple
        className="w-full"
        defaultValue={isAutoExpanded ? [`butir-${sila.id}`] : []}
      >
        <AccordionItem value={`butir-${sila.id}`} className="border-none">
          {/* The whole header row is the trigger so the click target is large and obvious */}
          <AccordionTrigger className="items-center gap-3 sm:gap-4 rounded-none p-4 sm:p-5 hover:bg-muted/40 hover:no-underline">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-muted/50 border border-border/80 p-1.5 flex items-center justify-center shrink-0">
                <img
                  src={sila.image}
                  alt={`${silaLabel} ${sila.id}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-medium text-muted-foreground">
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {silaLabel} {sila.id}
                  </span>
                  <span className="mx-1.5">·</span>
                  {countLabel}
                </div>
                <div className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  {highlightConstitutionText(sila.sila, searchTerm)}
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pb-0">
            <div className="divide-y divide-border/60 border-t border-border/60 px-4 sm:px-5">
              {sila.data.map((item: ButirItem) => (
                <div key={item.id} className="flex gap-3 sm:gap-4 py-3">
                  <span className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums w-6 shrink-0 pt-0.5">
                    {item.id}.
                  </span>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed flex-1">
                    {highlightConstitutionText(item.isi, searchTerm)}
                  </p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export const Route = createFileRoute("/(pages)/constitution/butir-pancasila")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAll, setExpandedAll] = useState(false);

  const toggleExpandAll = useCallback(() => {
    setExpandedAll((prev) => !prev);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Single source of truth: the list, the per-card counts and the summary all derive from this.
  const { visibleSila, butirCount } = useMemo(() => {
    const isSearching = !!searchTerm.trim();
    let totalMatchedButir = 0;

    const items: VisiblePancasilaItem[] = [];
    for (const sila of butirPancasilaData as PancasilaItem[]) {
      const base = { ...sila, totalCount: sila.data.length };

      if (!isSearching) {
        items.push({ ...base, matchedCount: sila.data.length });
        continue;
      }

      const matchedButir = sila.data.filter((b) => matchesConstitutionQuery(b.isi, searchTerm));
      const titleMatch = matchesConstitutionQuery(sila.sila, searchTerm);
      if (matchedButir.length === 0 && !titleMatch) continue;

      totalMatchedButir += matchedButir.length;
      items.push({
        ...base,
        // If only the title matched, still show the sila's butir so the card is not empty.
        data: matchedButir.length > 0 ? matchedButir : sila.data,
        matchedCount: matchedButir.length,
      });
    }

    return { visibleSila: items, butirCount: totalMatchedButir };
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <ConstitutionHero
        title={t(($) => $.constitution.butirPancasila.title)}
        description={t(($) => $.constitution.butirPancasila.description)}
        badges={[
          t(($) => $.constitution.butirPancasila.fiveSila),
          t(($) => $.constitution.butirPancasila.fortyFiveButir),
        ]}
      >
        <ConstitutionSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={clearSearch}
          placeholder={t(($) => $.constitution.butirPancasila.searchPlaceholder)}
          expandedAll={expandedAll}
          onToggleExpandAll={toggleExpandAll}
          openAllLabel={t(($) => $.constitution.butirPancasila.openAll)}
          closeAllLabel={t(($) => $.constitution.butirPancasila.closeAll)}
          summaryNode={
            <Trans
              i18nKey={getTranslationKey(($) => $.constitution.butirPancasila.foundResult)}
              values={{
                butirCount,
                silaCount: visibleSila.length,
              }}
              components={{
                1: <span className="font-bold text-red-600 dark:text-red-400" />,
                3: <span className="font-bold text-red-600 dark:text-red-400" />,
              }}
            />
          }
        />
      </ConstitutionHero>

      {visibleSila.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-card/50">
          <CardContent className="text-center py-12 flex flex-col items-center">
            <div className="mb-4 p-4 bg-muted rounded-full">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {t(($) => $.constitution.butirPancasila.noResultTitle)}
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md">
              {t(($) => $.constitution.butirPancasila.noResultDesc, { query: searchTerm })}
            </p>
            <Button onClick={clearSearch} variant="outline" className="rounded-xl">
              {t(($) => $.constitution.butirPancasila.clearSearch)}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleSila.map((sila) => (
            <PancasilaCard
              key={sila.id}
              sila={sila}
              searchTerm={searchTerm}
              isExpanded={expandedAll}
            />
          ))}
        </div>
      )}
    </div>
  );
}
