import React, { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Search, X } from 'lucide-react';

export const Route = createFileRoute('/_v1/constitution/butir-pancasila')({
  component: RouteComponent,
});

function RouteComponent() {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Butir-butir Pancasila data
  const butirPancasila = [
    {
      id: 1,
      sila: "Ketuhanan Yang Maha Esa",
      butir: [
        "Bangsa Indonesia menyatakan kepercayaannya dan ketakwaannya terhadap Tuhan Yang Maha Esa.",
        "Manusia Indonesia percaya dan takwa terhadap Tuhan Yang Maha Esa, sesuai dengan agama dan kepercayaannya masing-masing menurut dasar kemanusiaan yang adil dan beradab.",
        "Mengembangkan sikap hormat menghormati dan bekerjasama antara pemeluk agama dengan penganut kepercayaan yang berbeda-beda terhadap Tuhan Yang Maha Esa.",
        "Membina kerukunan hidup di antara sesama umat beragama dan kepercayaan terhadap Tuhan Yang Maha Esa.",
        "Agama dan kepercayaan terhadap Tuhan Yang Maha Esa adalah masalah yang menyangkut hubungan pribadi manusia dengan Tuhan Yang Maha Esa.",
        "Mengembangkan sikap saling menghormati kebebasan menjalankan ibadah sesuai dengan agama dan kepercayaannya masing-masing.",
        "Tidak memaksakan suatu agama dan kepercayaan terhadap Tuhan Yang Maha Esa kepada orang lain."
      ]
    },
    {
      id: 2,
      sila: "Kemanusiaan yang Adil dan Beradab",
      butir: [
        "Mengakui dan memperlakukan manusia sesuai dengan harkat dan martabatnya sebagai makhluk Tuhan Yang Maha Esa.",
        "Mengakui persamaan derajat, persamaan hak, dan kewajiban asasi setiap manusia, tanpa membeda-bedakan suku, keturunan, agama, kepercayaan, jenis kelamin, kedudukan sosial, warna kulit, dan sebagainya.",
        "Mengembangkan sikap saling mencintai sesama manusia.",
        "Mengembangkan sikap saling tenggang rasa dan tepa selira.",
        "Mengembangkan sikap tidak semena-mena terhadap orang lain.",
        "Menjunjung tinggi nilai-nilai kemanusiaan.",
        "Gemar melakukan kegiatan kemanusiaan.",
        "Berani membela kebenaran dan keadilan.",
        "Bangsa Indonesia merasa dirinya sebagai bagian dari seluruh umat manusia.",
        "Mengembangkan sikap hormat menghormati dan bekerjasama dengan bangsa lain."
      ]
    },
    {
      id: 3,
      sila: "Persatuan Indonesia",
      butir: [
        "Mampu menempatkan persatuan, kesatuan, serta kepentingan dan keselamatan bangsa dan negara sebagai kepentingan bersama di atas kepentingan pribadi dan golongan.",
        "Sanggup dan rela berkorban untuk kepentingan negara dan bangsa apabila diperlukan.",
        "Mengembangkan rasa cinta kepada tanah air dan bangsa.",
        "Mengembangkan rasa kebanggaan berkebangsaan dan bertanah air Indonesia.",
        "Memelihara ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi, dan keadilan sosial.",
        "Mengembangkan persatuan Indonesia atas dasar Bhinneka Tunggal Ika.",
        "Memajukan pergaulan demi persatuan dan kesatuan bangsa."
      ]
    },
    {
      id: 4,
      sila: "Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan",
      butir: [
        "Sebagai warga negara dan warga masyarakat, setiap manusia Indonesia mempunyai kedudukan, hak, dan kewajiban yang sama.",
        "Tidak boleh memaksakan kehendak kepada orang lain.",
        "Mengutamakan musyawarah dalam mengambil keputusan untuk kepentingan bersama.",
        "Musyawarah untuk mencapai mufakat diliputi oleh semangat kekeluargaan.",
        "Menghormati dan menjunjung tinggi setiap keputusan yang dicapai sebagai hasil musyawarah.",
        "Dengan itikad baik dan rasa tanggung jawab menerima dan melaksanakan hasil keputusan musyawarah.",
        "Di dalam musyawarah diutamakan kepentingan bersama di atas kepentingan pribadi dan golongan.",
        "Musyawarah dilakukan dengan akal sehat dan sesuai dengan hati nurani yang luhur.",
        "Keputusan yang diambil harus dapat dipertanggungjawabkan secara moral kepada Tuhan Yang Maha Esa, menjunjung tinggi harkat dan martabat manusia, nilai-nilai kebenaran dan keadilan mengutamakan persatuan dan kesatuan demi kepentingan bersama.",
        "Memberikan kepercayaan kepada wakil-wakil yang dipercayai untuk melaksanakan pemusyawaratan."
      ]
    },
    {
      id: 5,
      sila: "Keadilan Sosial bagi Seluruh Rakyat Indonesia",
      butir: [
        "Mengembangkan perbuatan yang luhur, yang mencerminkan sikap dan suasana kekeluargaan dan kegotongroyongan.",
        "Mengembangkan sikap adil terhadap sesama.",
        "Menjaga keseimbangan antara hak dan kewajiban.",
        "Menghormati hak orang lain.",
        "Suka memberi pertolongan kepada orang lain agar dapat berdiri sendiri.",
        "Tidak menggunakan hak milik untuk usaha-usaha yang bersifat pemerasan terhadap orang lain.",
        "Tidak menggunakan hak milik untuk hal-hal yang bersifat pemborosan dan gaya hidup mewah.",
        "Tidak menggunakan hak milik untuk bertentangan dengan atau merugikan kepentingan umum.",
        "Suka bekerja keras.",
        "Suka menghargai hasil karya orang lain yang bermanfaat bagi kemajuan dan kesejahteraan bersama.",
        "Suka melakukan kegiatan dalam rangka mewujudkan kemajuan yang merata dan berkeadilan sosial."
      ]
    }
  ];

  const iconMap = {
    1: <img src="/constitution/images/sila_1.png" alt="Sila 1" className="w-8 h-8" />,
    2: <img src="/constitution/images/sila_2.png" alt="Sila 2" className="w-8 h-8" />,
    3: <img src="/constitution/images/sila_3.png" alt="Sila 3" className="w-8 h-8" />,
    4: <img src="/constitution/images/sila_4.png" alt="Sila 4" className="w-8 h-8" />,
    5: <img src="/constitution/images/sila_5.png" alt="Sila 5" className="w-8 h-8" />
  };

  const colorMap = {
    1: 'from-red-50 to-white border-red-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700',
    2: 'from-white to-red-50 border-red-200 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700',
    3: 'from-red-50 to-white border-red-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700',
    4: 'from-white to-red-50 border-red-200 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700',
    5: 'from-red-50 to-white border-red-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700'
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Highlight text for search results
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 px-1 rounded dark:bg-yellow-300 dark:text-gray-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return butirPancasila;

    const query = searchTerm.toLowerCase();
    return butirPancasila
      .map(sila => {
        const silaMatch = sila.sila.toLowerCase().includes(query);
        const matchingButir = sila.butir.filter(butir =>
          butir.toLowerCase().includes(query)
        );

        if (silaMatch || matchingButir.length > 0) {
          return {
            ...sila,
            butir: matchingButir.length > 0 ? matchingButir : sila.butir,
          };
        }
        return null;
      })
      .filter((sila): sila is NonNullable<typeof sila> => sila !== null);
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Hero Section */}
      <section className="relative py-10">
        <div className="mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full shadow-sm transform hover:scale-110 transition-transform duration-300">
              <img src="/constitution/images/ic_pancasila.png" alt="Pancasila" className="w-24 h-24" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight dark:text-white">
            Butir-Butir Pancasila
          </h1>
          <p className="text-xl text-gray-600 mb-8 mx-auto leading-relaxed dark:text-gray-300">
            Pedoman hidup berbangsa dan bernegara yang mengandung nilai-nilai luhur bangsa Indonesia
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-sm font-semibold dark:bg-red-700 dark:hover:bg-red-800">
              5 Sila
            </Badge>
            <Badge className="bg-white hover:bg-gray-50 text-red-600 border-2 border-red-600 px-6 py-2 text-sm font-semibold dark:bg-gray-800 dark:text-red-400 dark:border-red-700 dark:hover:bg-gray-700">
              45 Butir Pengamalan
            </Badge>
          </div>
        </div>
      </section>

      <div className='flex flex-col gap-6 w-full'>
        <Separator className="dark:bg-gray-700" />

        {/* Search Section */}
        <section className="py-0">
          <div className="mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Cari butir Pancasila..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-12 py-6 text-lg border-2 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 dark:border-gray-700 dark:focus:border-red-500 dark:focus:ring-red-900/30 dark:bg-gray-800 dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors dark:hover:text-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Ditemukan <span className="font-semibold text-red-600 dark:text-red-400">{filteredData.length}</span> hasil
              </p>
            )}
          </div>
        </section>

        {/* Content Section */}
        <section className="">
          <div className="mx-auto">
            {filteredData.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 bg-gray-100 rounded-full dark:bg-gray-800">
                    <Search className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
                  Tidak Ada Hasil
                </h3>
                <p className="text-gray-600 mb-4 dark:text-gray-400">
                  Tidak ditemukan butir Pancasila yang sesuai dengan pencarian "{searchTerm}"
                </p>
                <button
                  onClick={clearSearch}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Hapus Pencarian
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredData.map((sila) => (
                  <Card
                    key={sila.id}
                    className={`bg-gradient-to-br ${colorMap[sila.id as keyof typeof colorMap]} border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 dark:shadow-gray-900`}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-md border-2 border-red-200 dark:bg-gray-800 dark:border-gray-700">
                          <div className="text-red-600 dark:text-red-400">
                            {iconMap[sila.id as keyof typeof iconMap]}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={'bg-red-600 text-white hover:bg-red-700 dark:bg-red-400 dark:hover:bg-red-600 dark:text-gray-900'}>
                              Sila {sila.id}
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl font-bold text-gray-900 leading-tight dark:text-white">
                            {highlightText(sila.sila, searchTerm)}
                          </CardTitle>
                          <CardDescription className="text-gray-600 mt-2 dark:text-gray-300">
                            {sila.butir.length} Butir Pengamalan{searchTerm && ' yang sesuai'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={`butir-${sila.id}`} className="border-none">
                          <AccordionTrigger className="text-red-700 hover:text-red-800 font-semibold hover:no-underline py-3 dark:text-red-400 dark:hover:text-red-300">
                            <span className="flex items-center gap-2">
                              Lihat Butir Pengamalan
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="mt-4 space-y-4">
                              {sila.butir.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-red-100 hover:border-red-300 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
                                >
                                  <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm dark:bg-red-400 dark:text-gray-900">
                                      {idx + 1}
                                    </div>
                                  </div>
                                  <p className="text-gray-700 leading-relaxed flex-1 dark:text-gray-300">
                                    {highlightText(item, searchTerm)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}