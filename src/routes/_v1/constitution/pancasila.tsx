import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_v1/constitution/pancasila')({
    component: RouteComponent,
})

function RouteComponent() {
    // Pancasila data with images from public/pancasila/images
    const pancasilaData = [
        {
            id: 1,
            title: "Ketuhanan Yang Maha Esa",
            image: "/constitution/images/sila_1.png"
        },
        {
            id: 2,
            title: "Kemanusiaan yang adil dan beradab",
            image: "/constitution/images/sila_2.png"
        },
        {
            id: 3,
            title: "Persatuan Indonesia",
            image: "/constitution/images/sila_3.png"
        },
        {
            id: 4,
            title: "Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan",
            image: "/constitution/images/sila_4.png"
        },
        {
            id: 5,
            title: "Keadilan sosial bagi seluruh rakyat Indonesia",
            image: "/constitution/images/sila_5.png"
        }
    ]

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
                    <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight dark:text-white">
                        Pancasila
                    </h1>
                    {/* <p className="text-xl text-gray-600 mb-8 mx-auto leading-relaxed dark:text-gray-300">
                        Dasar falsafah dan ideologi negara Republik Indonesia
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <span className="bg-red-600 text-white px-6 py-2 text-sm font-semibold rounded-full dark:bg-red-700">
                            5 Sila
                        </span>
                        <span className="bg-white text-red-600 border-2 border-red-600 px-6 py-2 text-sm font-semibold rounded-full dark:bg-gray-800 dark:text-red-400 dark:border-red-700">
                            Dasar Negara
                        </span>
                    </div> */}
                </div>
            </section>

            <div className='flex flex-col gap-6 w-full'>
                <div className="mx-auto w-full">
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex flex-col gap-8">
                            {pancasilaData.map((sila) => (
                                <section key={sila.id} className="flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={sila.image}
                                            alt={sila.title}
                                            className="w-16 h-16 object-contain"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl text-slate-900 dark:text-slate-100 mb-2">
                                            {sila.id}. {sila.title}
                                        </h2>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}