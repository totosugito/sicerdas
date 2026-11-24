import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConstitutionHero } from "@/features/constitution";
import { useAppTranslation } from "@/lib/i18n-typed";
import { AppRoute } from "@/constants/app-route";
import { ArrowRight } from "lucide-react";
import butirPancasilaData from "@/data/constitution/butir_pancasila.json";

export const Route = createFileRoute("/(pages)/constitution/pancasila")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation();

  const pancasilaData = [
    {
      id: 1,
      title: "Ketuhanan Yang Maha Esa",
      symbol: "Bintang Emas Perisai Hitam",
      meaning:
        "Melambangkan cahaya kerohanian yang dipancarkan oleh Tuhan kepada setiap manusia serta pengakuan bangsa Indonesia akan keberadaan Tuhan Yang Maha Esa.",
      image: "/constitution/images/sila_1.png",
      butirCount: butirPancasilaData.find((b) => b.id === 1)?.data.length ?? 7,
    },
    {
      id: 2,
      title: "Kemanusiaan yang adil dan beradab",
      symbol: "Rantai Emas Bermata Bulat & Persegi",
      meaning:
        "Mata rantai segi empat melambangkan laki-laki dan lingkaran melambangkan perempuan yang saling berkaitan erat, mewakili hubungan manusia yang setara dan saling membantu.",
      image: "/constitution/images/sila_2.png",
      butirCount: butirPancasilaData.find((b) => b.id === 2)?.data.length ?? 10,
    },
    {
      id: 3,
      title: "Persatuan Indonesia",
      symbol: "Pohon Beringin",
      meaning:
        "Pohon besar dengan akar tunjang yang kuat dan sulur yang menjalar ke segala arah, melambangkan Indonesia sebagai tempat berteduh seluruh suku, agama, dan budaya.",
      image: "/constitution/images/sila_3.png",
      butirCount: butirPancasilaData.find((b) => b.id === 3)?.data.length ?? 7,
    },
    {
      id: 4,
      title: "Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan",
      symbol: "Kepala Banteng",
      meaning:
        "Banteng merupakan hewan sosial yang gemar berkumpul dan kuat ketika bersatu, melambangkan budaya bangsa Indonesia yang mengutamakan musyawarah untuk mufakat.",
      image: "/constitution/images/sila_4.png",
      butirCount: butirPancasilaData.find((b) => b.id === 4)?.data.length ?? 10,
    },
    {
      id: 5,
      title: "Keadilan sosial bagi seluruh rakyat Indonesia",
      symbol: "Padi dan Kapas",
      meaning:
        "Padi melambangkan pangan dan kapas melambangkan sandang sebagai kebutuhan pokok seluruh rakyat Indonesia secara adil, merata, dan tanpa kesenjangan.",
      image: "/constitution/images/sila_5.png",
      butirCount: butirPancasilaData.find((b) => b.id === 5)?.data.length ?? 11,
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      <ConstitutionHero
        title="Pancasila"
        subtitle="Dasar Negara Republik Indonesia"
        description="Lima dasar ideologi dan falsafah hidup berbangsa serta bernegara bagi seluruh rakyat Indonesia."
        badges={[
          t(($) => $.constitution.butirPancasila.fiveSila),
          t(($) => $.constitution.butirPancasila.fortyFiveButir),
          "Bhinneka Tunggal Ika",
        ]}
      />

      <Card className="border-border bg-card shadow-xs overflow-hidden">
        <div className="divide-y divide-border/70">
          {pancasilaData.map((sila) => (
            <div
              key={sila.id}
              className="p-4 sm:p-6 flex items-start gap-4 sm:gap-5 hover:bg-muted/30 transition-colors"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted/50 border border-border/80 p-2 flex items-center justify-center shrink-0">
                <img src={sila.image} alt={sila.title} className="w-full h-full object-contain" />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {t(($) => $.constitution.butirPancasila.sila)} {sila.id}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{sila.symbol}</span>
                  </div>
                  <Link
                    to={AppRoute.constitution.butirPancasila.url}
                    className="text-xs font-medium text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    {sila.butirCount} Butir →
                  </Link>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  {sila.title}
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
                  {sila.meaning}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {t(($) => $.constitution.butirPancasila.title)}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t(($) => $.constitution.butirPancasila.description)}
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link to={AppRoute.constitution.butirPancasila.url} />}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white dark:bg-red-500/20 dark:text-red-300 dark:border dark:border-red-500/40 dark:hover:bg-red-500/30 rounded-xl font-semibold gap-2 shrink-0"
          >
            <span>{t(($) => $.constitution.butirPancasila.viewButir)}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
