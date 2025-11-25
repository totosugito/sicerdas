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
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex flex-col items-center mb-12 gap-4">
                    <img
                        src="/constitution/images/ic_pancasila.png"
                        alt="Pancasila Symbol"
                        className="w-32 h-32 object-contain mb-4"
                    />
                    <h1 className="text-slate-900 dark:text-slate-100 text-3xl md:text-4xl font-black">
                        Pancasila
                    </h1>
                </div>

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
    )
}