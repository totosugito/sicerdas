import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react';
import { AppNavbar } from '@/components/app';
import { AndroidAppSection, CTASection, FeaturesSection, Footer, HeroSection } from '@/components/pages/landing';

export const Route = createFileRoute('/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/books/latest?search=${encodeURIComponent(searchQuery)}`
        }
    }

    return (
        <div className="min-h-screen w-full bg-background">
            <AppNavbar />

            <HeroSection
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
            />

            <FeaturesSection />

            <AndroidAppSection />

            <CTASection />

            <Footer />
        </div>
    )
}