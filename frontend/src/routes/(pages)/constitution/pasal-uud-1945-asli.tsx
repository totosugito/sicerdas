import { createFileRoute } from "@tanstack/react-router";
import { useAppTranslation, getTranslationKey } from "@/lib/i18n-typed";
import { ConstitutionArticlesView } from "@/features/constitution";
import uud1945Data from "@/data/constitution/pasal_uud_1945_asli.json";

export const Route = createFileRoute("/(pages)/constitution/pasal-uud-1945-asli")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation();

  return (
    <ConstitutionArticlesView
      data={uud1945Data}
      title={t(($) => $.constitution.uud1945Asli.title)}
      description={t(($) => $.constitution.uud1945Asli.description)}
      badges={[
        t(($) => $.constitution.uud1945Asli.articleCount, { count: 37 }),
        t(($) => $.constitution.uud1945Asli.transitionalProvisionCount, { count: 4 }),
        t(($) => $.constitution.uud1945Asli.additionalProvisionCount, { count: 1 }),
      ]}
      searchPlaceholder={t(($) => $.constitution.uud1945Asli.searchPlaceholder)}
      openAllLabel={t(($) => $.constitution.uud1945Asli.openAll)}
      closeAllLabel={t(($) => $.constitution.uud1945Asli.closeAll)}
      foundResultI18nKey={getTranslationKey(($) => $.constitution.uud1945Asli.foundResult)}
      noResultTitle={t(($) => $.constitution.uud1945Asli.noResultTitle)}
      getNoResultDesc={(query) => t(($) => $.constitution.uud1945Asli.noResultDesc, { query })}
      clearSearchLabel={t(($) => $.constitution.uud1945Asli.clearSearch)}
      viewAyatLabel={t(($) => $.constitution.uud1945Asli.viewAyat)}
      getBadgeLabel={(title) =>
        title.includes("(Aturan Peralihan)") || title.includes("Aturan Peralihan")
          ? t(($) => $.constitution.uud1945Asli.transitionalProvision)
          : title.includes("Aturan Pertambahan") || title.includes("Aturan Tambahan")
            ? t(($) => $.constitution.uud1945Asli.additionalProvision)
            : t(($) => $.constitution.uud1945Asli.article)
      }
      getAyatCountLabel={(matchCount, totalCount, isSearching) =>
        isSearching
          ? t(($) => $.constitution.uud1945Asli.matchingAyat, { matchCount, totalCount })
          : t(($) => $.constitution.uud1945Asli.ayatCount, { totalCount })
      }
    />
  );
}
