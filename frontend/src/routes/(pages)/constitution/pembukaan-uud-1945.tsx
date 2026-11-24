import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ConstitutionHero } from "@/features/constitution";

export const Route = createFileRoute("/(pages)/constitution/pembukaan-uud-1945")({
  component: RouteComponent,
});

function RouteComponent() {
  const preambleData = [
    {
      roman: "I",
      label: "Alinea Pertama",
      theme: "Hak Kemerdekaan Segala Bangsa",
      text: "Bahwa sesungguhnya Kemerdekaan itu ialah hak segala bangsa dan oleh sebab itu, maka penjajahan di atas dunia harus dihapuskan, karena tidak sesuai dengan peri-kemanusiaan dan peri-keadilan.",
    },
    {
      roman: "II",
      label: "Alinea Kedua",
      theme: "Perjuangan Pergerakan Kemerdekaan",
      text: "Dan perjuangan pergerakan kemerdekaan Indonesia telah sampailah kepada saat yang berbahagia dengan selamat sentausa mengantarkan rakyat Indonesia ke depan pintu gerbang kemerdekaan Negara Indonesia, yang merdeka, bersatu, berdaulat, adil dan makmur.",
    },
    {
      roman: "III",
      label: "Alinea Ketiga",
      theme: "Pernyataan Kemerdekaan Atas Rahmat Tuhan",
      text: "Atas berkat rakhmat Allah Yang Maha Kuasa dan dengan didorongkan oleh keinginan luhur, supaya berkehidupan kebangsaan yang bebas, maka rakyat Indonesia menyatakan dengan ini kemerdekaannya.",
    },
    {
      roman: "IV",
      label: "Alinea Keempat",
      theme: "Tujuan Negara & Dasar Negara Pancasila",
      text: "Kemudian daripada itu untuk membentuk suatu Pemerintah Negara Indonesia yang melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia dan untuk memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa, dan ikut melaksanakan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi dan keadilan sosial, maka disusunlah Kemerdekaan Kebangsaan Indonesia itu dalam suatu Undang-Undang Dasar Negara Indonesia, yang terbentuk dalam suatu susunan Negara Republik Indonesia yang berkedaulatan rakyat dengan berdasar kepada Ketuhanan Yang Maha Esa, Kemanusiaan yang adil dan beradab, Persatuan Indonesia dan Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam Permusyawaratan/Perwakilan, serta dengan mewujudkan suatu Keadilan sosial bagi seluruh rakyat Indonesia.",
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      <ConstitutionHero
        title="Pembukaan UUD 1945"
        subtitle="Undang-Undang Dasar Negara Republik Indonesia Tahun 1945"
        description="Naskah Pembukaan Undang-Undang Dasar 1945 yang memuat pokok-pokok pikiran, cita-cita luhur proklamasi, tujuan negara, dan rumusan dasar negara Pancasila."
        badges={["4 Alinea", "Pokok Kaidah Fundamental", "18 Agustus 1945"]}
      />

      <Card className="border-border bg-card shadow-xs overflow-hidden">
        <div className="divide-y divide-border/70">
          {preambleData.map((item) => (
            <div key={item.roman} className="p-5 sm:p-7 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium flex-wrap">
                <span className="font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{item.theme}</span>
              </div>

              <p className="text-foreground/95 text-base sm:text-[17px] leading-relaxed font-serif max-w-4xl">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
