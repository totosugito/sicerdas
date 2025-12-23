import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_v1/constitution/pembukaan-uud-1945')({
  component: RouteComponent,
})

function RouteComponent() {
  // Pembukaan UUD 1945 text data
  const preambleData = [
    "Bahwa sesungguhnya Kemerdekaan itu ialah hak segala bangsa dan oleh sebab itu, maka penjajahan di atas dunia harus dihapuskan, karena tidak sesuai dengan peri-kemanusiaan dan peri-keadilan.\n\n",
    "Dan perjuangan pergerakan kemerdekaan Indonesia telah sampailah kepada saat yang berbahagia dengan selamat sentausa mengantarkan rakyat Indonesia ke depan pintu gerbang kemerdekaan Negara Indonesia, yang merdeka, bersatu, berdaulat, adil dan makmur.\n\n",
    "Atas berkat rakhmat Allah Yang Maha Kuasa dan dengan didorongkan oleh keinginan luhur, supaya berkehidupan kebangsaan yang bebas, maka rakyat Indonesia menyatakan dengan ini kemerdekaannya.\n\n",
    "Kemudian daripada itu untuk membentuk suatu Pemerintah Negara Indonesia yang melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia dan untuk memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa, dan ikut melaksanakan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi dan keadilan sosial, maka disusunlah Kemerdekaan Kebangsaan Indonesia itu dalam suatu Undang-Undang Dasar Negara Indonesia, yang terbentuk dalam suatu susunan Negara Republik Indonesia yang berkedaulatan rakyat dengan berdasar kepada Ketuhanan Yang Maha Esa, Kemanusiaan yang adil dan beradab, Persatuan Indonesia dan Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam Permusyawaratan/Perwakilan, serta dengan mewujudkan suatu Keadilan sosial bagi seluruh rakyat Indonesia.\n"
  ];

  return (
    <div className="flex flex-col gap-6 w-full py-6">
      <div className='flex flex-col gap-6 w-full'>
        <div className="mx-auto w-full">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">

            {/* Hero Section */}
            <section className="relative pb-10">
              <div className="flex flex-col mx-auto text-center gap-2">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 rounded-full shadow-sm transform hover:scale-110 transition-transform duration-300">
                    <img
                      src="/constitution/images/ic_pancasila.png"
                      alt="Pancasila Symbol"
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  UNDANG-UNDANG DASAR
                </h1>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 dark:text-gray-200">
                  NEGARA REPUBLIK INDONESIA TAHUN 1945
                </h2>
                <h3 className="text-2xl sm:text-3xl font-bold mt-5">
                  PEMBUKAAN
                </h3>
              </div>
            </section>

            <div className="flex flex-col gap-6">
              {preambleData.map((paragraph, index) => (
                <p key={index} className="text-slate-800 dark:text-slate-200 text-base md:text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}