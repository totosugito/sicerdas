import { createFileRoute } from "@tanstack/react-router";
import { useAppTranslation, getTranslationKey } from "@/lib/i18n-typed";
import { ConstitutionArticlesView } from "@/features/constitution";
import uud1945Data from "@/data/constitution/pasal_uud_1945_amandemen.json";

export const Route = createFileRoute("/(pages)/constitution/pasal-uud-1945-amandemen")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation();

  return (
    <ConstitutionArticlesView
      data={uud1945Data}
      title={t(($) => $.constitution.uudAmandemen.title)}
      description={t(($) => $.constitution.uudAmandemen.description)}
      badges={[
        t(($) => $.constitution.uudAmandemen.articleCount, { count: 37 }),
        t(($) => $.constitution.uudAmandemen.transitionalProvisionCount, { count: 3 }),
        t(($) => $.constitution.uudAmandemen.additionalProvisionCount, { count: 2 }),
      ]}
      searchPlaceholder={t(($) => $.constitution.uudAmandemen.searchPlaceholder)}
      openAllLabel={t(($) => $.constitution.uudAmandemen.openAll)}
      closeAllLabel={t(($) => $.constitution.uudAmandemen.closeAll)}
      foundResultI18nKey={getTranslationKey(($) => $.constitution.uudAmandemen.foundResult)}
      noResultTitle={t(($) => $.constitution.uudAmandemen.noResultTitle)}
      getNoResultDesc={(query) => t(($) => $.constitution.uudAmandemen.noResultDesc, { query })}
      clearSearchLabel={t(($) => $.constitution.uudAmandemen.clearSearch)}
      viewAyatLabel={t(($) => $.constitution.uudAmandemen.viewAyat)}
      getBadgeLabel={(title) =>
        title.includes("Aturan Peralihan")
          ? t(($) => $.constitution.uudAmandemen.transitionalProvision)
          : title.includes("Aturan Tambahan")
            ? t(($) => $.constitution.uudAmandemen.additionalProvision)
            : t(($) => $.constitution.uudAmandemen.article)
      }
      getAmendmentBadgeLabel={(val) => t(($) => $.constitution.uudAmandemen.amendment, { val })}
      getAyatCountLabel={(matchCount, totalCount, isSearching) =>
        isSearching
          ? t(($) => $.constitution.uudAmandemen.matchingAyat, { matchCount, totalCount })
          : t(($) => $.constitution.uudAmandemen.ayatCount, { totalCount })
      }
    />
  );
}
