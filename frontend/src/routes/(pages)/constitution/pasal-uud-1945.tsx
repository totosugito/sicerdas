import { createFileRoute } from "@tanstack/react-router";
import { useAppTranslation, getTranslationKey } from "@/lib/i18n-typed";
import { ConstitutionArticlesView } from "@/features/constitution";
import uud1945Data from "@/data/constitution/pasal_uud_1945.json";

export const Route = createFileRoute("/(pages)/constitution/pasal-uud-1945")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation();

  return (
    <ConstitutionArticlesView
      data={uud1945Data}
      title={t(($) => $.constitution.uud1945.title)}
      description={t(($) => $.constitution.uud1945.description)}
      badges={[
        t(($) => $.constitution.uud1945.articleCount, { count: 37 }),
        t(($) => $.constitution.uud1945.transitionalProvisionCount, { count: 3 }),
        t(($) => $.constitution.uud1945.additionalProvisionCount, { count: 2 }),
      ]}
      searchPlaceholder={t(($) => $.constitution.uud1945.searchPlaceholder)}
      openAllLabel={t(($) => $.constitution.uud1945.openAll)}
      closeAllLabel={t(($) => $.constitution.uud1945.closeAll)}
      foundResultI18nKey={getTranslationKey(($) => $.constitution.uud1945.foundResult)}
      noResultTitle={t(($) => $.constitution.uud1945.noResultTitle)}
      getNoResultDesc={(query) => t(($) => $.constitution.uud1945.noResultDesc, { query })}
      clearSearchLabel={t(($) => $.constitution.uud1945.clearSearch)}
      viewAyatLabel={t(($) => $.constitution.uud1945.viewAyat)}
      getBadgeLabel={(title) =>
        title.includes("(Aturan Peralihan)")
          ? t(($) => $.constitution.uud1945.transitionalProvision)
          : title.includes("(Aturan Tambahan)")
            ? t(($) => $.constitution.uud1945.additionalProvision)
            : t(($) => $.constitution.uud1945.article)
      }
      getAyatCountLabel={(matchCount, totalCount, isSearching) =>
        isSearching
          ? t(($) => $.constitution.uud1945.matchingAyat, { matchCount, totalCount })
          : t(($) => $.constitution.uud1945.ayatCount, { totalCount })
      }
    />
  );
}
