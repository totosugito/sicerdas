import { AppRoute } from '@/constants/app-route';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { AndroidAppSection, CTASection, FeaturesSection, Footer, HeroSection } from '@/components/pages/landing';
import { AppNavbar } from '@/components/app';

export const Route = createFileRoute('/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = AppRoute.book.books.url + `?search=${encodeURIComponent(searchQuery)}`
        }
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-background">
            <AppNavbar />
            <div className='flex flex-col flex-1'>
                <HeroSection
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    handleSearch={handleSearch}
                />

                <FeaturesSection />

                <AndroidAppSection />

                <CTASection />
            </div>
            <Footer />
        </div>
    )
}