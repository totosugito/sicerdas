import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Trans } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search } from "lucide-react";
import { ConstitutionPagination } from "./ConstitutionPagination";
import { ConstitutionHero } from "./ConstitutionHero";
import {
  ConstitutionSearchBar,
  highlightConstitutionText,
  matchesConstitutionQuery,
} from "./ConstitutionSearchBar";

export interface ConstitutionAyat {
  id: number;
  isi: string;
}

export interface ConstitutionPasal {
  title: string;
  data: ConstitutionAyat[];
  bab?: string;
  amandemen?: string;
}

interface ConstitutionArticlesViewProps {
  data: ConstitutionPasal[];
  title: string;
  description: string;
  badges: string[];
  searchPlaceholder: string;
  openAllLabel: string;
  closeAllLabel: string;
  foundResultI18nKey: string;
  noResultTitle: string;
  getNoResultDesc: (query: string) => string;
  clearSearchLabel: string;
  viewAyatLabel: string;
  getBadgeLabel: (title: string) => string;
  getAmendmentBadgeLabel?: (amandemen: string) => string | null;
  getAyatCountLabel: (matchCount: number, totalCount: number, isSearching: boolean) => string;
}

export const ConstitutionArticlesView: React.FC<ConstitutionArticlesViewProps> = ({
  data,
  title,
  description,
  badges,
  searchPlaceholder,
  openAllLabel,
  closeAllLabel,
  foundResultI18nKey,
  noResultTitle,
  getNoResultDesc,
  clearSearchLabel,
  viewAyatLabel,
  getBadgeLabel,
  getAmendmentBadgeLabel,
  getAyatCountLabel,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAll, setExpandedAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const toggleExpandAll = useCallback(() => {
    setExpandedAll((prev) => !prev);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const { visiblePasal, ayatCount } = useMemo(() => {
    const isSearching = !!searchTerm.trim();
    let totalMatchedAyat = 0;

    const items = data
      .map((pasal) => {
        if (!isSearching) {
          return {
            ...pasal,
            totalCount: pasal.data.length,
            matchedCount: pasal.data.length,
          };
        }

        const matchedAyat = pasal.data.filter((ayat) =>
          matchesConstitutionQuery(ayat.isi, searchTerm),
        );
        const pasalMatch = matchesConstitutionQuery(pasal.title, searchTerm);
        const babMatch = pasal.bab ? matchesConstitutionQuery(pasal.bab, searchTerm) : false;
        const amandemenMatch = pasal.amandemen
          ? matchesConstitutionQuery(pasal.amandemen, searchTerm)
          : false;

        if (matchedAyat.length === 0 && !pasalMatch && !babMatch && !amandemenMatch) {
          return null;
        }

        totalMatchedAyat += matchedAyat.length;
        return {
          ...pasal,
          data: matchedAyat.length > 0 ? matchedAyat : pasal.data,
          totalCount: pasal.data.length,
          matchedCount: matchedAyat.length,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return { visiblePasal: items, ayatCount: totalMatchedAyat };
  }, [data, searchTerm]);

  const totalPages = Math.ceil(visiblePasal.length / itemsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return visiblePasal.slice(start, start + itemsPerPage);
  }, [currentPage, visiblePasal]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isSearching = !!searchTerm.trim();
  const isAutoExpanded = expandedAll || isSearching;

  return (
    <div className="flex flex-col gap-6 w-full">
      <ConstitutionHero title={title} description={description} badges={badges}>
        <ConstitutionSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={clearSearch}
          placeholder={searchPlaceholder}
          expandedAll={expandedAll}
          onToggleExpandAll={toggleExpandAll}
          openAllLabel={openAllLabel}
          closeAllLabel={closeAllLabel}
          summaryNode={
            <Trans
              i18nKey={foundResultI18nKey}
              values={{
                ayatCount,
                pasalCount: visiblePasal.length,
              }}
              components={{
                1: <span className="font-bold text-red-600 dark:text-red-400" />,
                3: <span className="font-bold text-red-600 dark:text-red-400" />,
              }}
            />
          }
        />
      </ConstitutionHero>

      {visiblePasal.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-card/50">
          <CardContent className="text-center py-12 flex flex-col items-center">
            <div className="mb-4 p-4 bg-muted rounded-full">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{noResultTitle}</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md">
              {getNoResultDesc(searchTerm)}
            </p>
            <Button onClick={clearSearch} variant="outline" className="rounded-xl">
              {clearSearchLabel}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentData.map((pasal) => {
            const shortNumber = pasal.title
              .replace("Pasal ", "")
              .replace(" (Aturan Peralihan)", "")
              .replace(" (Aturan Tambahan)", "")
              .replace("Aturan Peralihan ", "")
              .replace("Aturan Tambahan ", "")
              .replace("Aturan Pertambahan ", "");

            const amendmentBadge =
              pasal.amandemen && pasal.amandemen !== "0" && getAmendmentBadgeLabel
                ? getAmendmentBadgeLabel(pasal.amandemen)
                : null;

            const countLabel = getAyatCountLabel(
              pasal.matchedCount,
              pasal.totalCount,
              isSearching && pasal.matchedCount > 0,
            );

            return (
              <Card key={pasal.title} className="border-border bg-card shadow-xs overflow-hidden">
                <Accordion
                  key={`${pasal.title}-${isAutoExpanded}`}
                  multiple
                  className="w-full"
                  defaultValue={isAutoExpanded ? [`ayat-${pasal.title}`] : []}
                >
                  <AccordionItem value={`ayat-${pasal.title}`} className="border-none">
                    <AccordionTrigger className="items-center gap-3 sm:gap-4 rounded-none p-4 sm:p-5 hover:bg-muted/40 hover:no-underline">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted/50 border border-border/80 flex items-center justify-center shrink-0">
                          <span className="text-red-600 dark:text-red-400 font-bold text-sm sm:text-base text-center leading-none px-1 tabular-nums">
                            {shortNumber}
                          </span>
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="text-xs font-medium text-muted-foreground flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              {getBadgeLabel(pasal.title)}
                            </span>
                            {amendmentBadge && (
                              <>
                                <span>·</span>
                                <span className="text-amber-700 dark:text-amber-400">
                                  {amendmentBadge}
                                </span>
                              </>
                            )}
                            {pasal.bab && (
                              <>
                                <span>·</span>
                                <span>{highlightConstitutionText(pasal.bab, searchTerm)}</span>
                              </>
                            )}
                            <span>·</span>
                            <span>{countLabel}</span>
                          </div>
                          <div className="text-base sm:text-lg font-bold text-foreground leading-snug">
                            {highlightConstitutionText(pasal.title, searchTerm)}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-0">
                      <div className="divide-y divide-border/60 border-t border-border/60 px-4 sm:px-5">
                        {pasal.data.map((ayat) => (
                          <div key={ayat.id} className="flex gap-3 sm:gap-4 py-3">
                            <span className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums w-7 shrink-0 pt-0.5">
                              ({ayat.id})
                            </span>
                            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed flex-1">
                              {highlightConstitutionText(ayat.isi, searchTerm)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            );
          })}

          <ConstitutionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="pt-4"
          />
        </div>
      )}
    </div>
  );
};
