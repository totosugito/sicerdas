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
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col items-center mb-8 gap-4">
          <img
            src="/constitution/images/ic_pancasila.png"
            alt="Pancasila Symbol"
            className="w-32 h-32 object-contain mb-4"
          />
          <div className="text-center">
            <h1 className="text-slate-900 dark:text-slate-100 text-2xl md:text-3xl font-bold mb-2">
              UNDANG-UNDANG DASAR
            </h1>
            <h2 className="text-slate-900 dark:text-slate-100 text-xl md:text-2xl font-semibold mb-2">
              NEGARA REPUBLIK INDONESIA TAHUN 1945
            </h2>
            <h3 className="text-slate-900 dark:text-slate-100 text-2xl md:text-3xl font-bold">
              PEMBUKAAN
            </h3>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          {preambleData.map((paragraph, index) => (
            <p key={index} className="text-slate-800 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
