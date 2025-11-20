import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { LandingNavbar } from '@/components/app'
import {
    HeroSection,
    FeaturesSection,
    AndroidAppSection,
    CTASection,
    Footer
} from '@/components/pages/landing'

export const Route = createFileRoute('/__v1/home')({
    component: HomePage,
})

function HomePage() {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/books/latest?search=${encodeURIComponent(searchQuery)}`
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <LandingNavbar />

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

export default HomePage
