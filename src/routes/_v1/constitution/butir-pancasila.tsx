import React, { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/_v1/constitution/butir-pancasila')({
  component: RouteComponent,
});

function RouteComponent() {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Butir-butir Pancasila data
  const butirPancasila = [
    {
      title: "Sila 1",
      subTitle: "Ketuhanan Yang Maha Esa",
      image: "/constitution/images/sila_1.png",
      data: [
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
      title: "Sila 2",
      subTitle: "Kemanusiaan yang Adil dan Beradab",
      image: "/constitution/images/sila_2.png",
      data: [
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
      title: "Sila 3",
      subTitle: "Persatuan Indonesia",
      image: "/constitution/images/sila_3.png",
      data: [
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
      title: "Sila 4",
      subTitle: "Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan",
      image: "/constitution/images/sila_4.png",
      data: [
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
      title: "Sila 5",
      subTitle: "Keadilan Sosial bagi Seluruh Rakyat Indonesia",
      image: "/constitution/images/sila_5.png",
      data: [
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

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return butirPancasila;
    
    return butirPancasila.map(sila => {
      // Check if sila title or subtitle matches
      const titleMatch = sila.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        sila.subTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter data points
      const filteredItems = sila.data.filter(item => 
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Return sila with filtered items if there's a match
      // If title matches, show all items in that sila
      // If title doesn't match but items do, show only matching items
      if (titleMatch || filteredItems.length > 0) {
        return {
          ...sila,
          data: titleMatch ? sila.data : filteredItems
        };
      }
      
      // Return null if no match
      return null;
    }).filter((sila): sila is NonNullable<typeof sila> => sila !== null); // Remove null values and type guard
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col items-center mb-8 gap-4">
          <img
            src="/constitution/images/ic_pancasila.png"
            alt="Pancasila Symbol"
            className="w-32 h-32 object-contain mb-4"
          />
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl md:text-4xl font-black">
            Butir-Butir Pancasila
          </h1>
        </div>
        
        {/* Search Input */}
        <div className="mb-8 w-full max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="Cari butir Pancasila..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-6 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>

        <div className="flex flex-col gap-12">
          {filteredData.length > 0 ? (
            filteredData.map((sila, index) => (
              <section key={index} className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <img
                      src={sila.image}
                      alt={sila.subTitle}
                      className="w-16 h-16 object-contain mb-2"
                    />
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {sila.title}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl text-slate-900 dark:text-slate-100 font-bold mb-4">
                      {sila.subTitle}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {sila.data.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="text-slate-900 dark:text-slate-100 font-medium min-w-[24px]">
                            {idx + 1}.
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 text-base md:text-lg">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-700 dark:text-slate-300 text-lg">
                Tidak ada hasil yang ditemukan untuk "{searchTerm}".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
