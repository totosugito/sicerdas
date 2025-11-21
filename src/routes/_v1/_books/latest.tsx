import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Search,
    BookOpen,
    Filter,
    Grid3x3,
    List
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { LandingNavbar } from '@/components/app'

export const Route = createFileRoute('/_v1/_books/latest')({
    component: BooksLatestPage,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            search: (search.search as string) || '',
        }
    },
})

// Sample book data
const sampleBooks = [
    {
        id: 1,
        title: 'Matematika Lanjutan untuk SMA',
        category: 'Matematika',
        curriculum: 'Kurikulum Merdeka',
        cover: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=500&fit=crop',
        description: 'Buku teks matematika komprehensif yang mencakup kalkulus, aljabar, dan statistika.',
        grade: 'Kelas 12',
        year: 2024
    },
    {
        id: 2,
        title: 'Bahasa Indonesia dan Sastra',
        category: 'Bahasa',
        curriculum: 'Kurikulum 2013',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=500&fit=crop',
        description: 'Kuasai keterampilan bahasa Indonesia dengan studi tata bahasa dan sastra yang komprehensif.',
        grade: 'Kelas 11',
        year: 2024
    },
    {
        id: 3,
        title: 'Fisika: Mekanika dan Termodinamika',
        category: 'Sains',
        curriculum: 'Kurikulum Merdeka',
        cover: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=500&fit=crop',
        description: 'Jelajahi prinsip-prinsip dasar fisika melalui contoh-contoh praktis.',
        grade: 'Kelas 11',
        year: 2024
    },
    {
        id: 4,
        title: 'Kimia: Organik dan Anorganik',
        category: 'Sains',
        curriculum: 'Kurikulum 2013',
        cover: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=500&fit=crop',
        description: 'Mendalami reaksi kimia, senyawa, dan teknik laboratorium.',
        grade: 'Kelas 12',
        year: 2024
    },
    {
        id: 5,
        title: 'Sejarah dan Budaya Indonesia',
        category: 'IPS',
        curriculum: 'Kurikulum 2013',
        cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=500&fit=crop',
        description: 'Perjalanan melalui sejarah Indonesia yang kaya dari kerajaan kuno hingga era modern.',
        grade: 'Kelas 10',
        year: 2024
    },
    {
        id: 6,
        title: 'Bahasa Inggris untuk Tujuan Akademik',
        category: 'Bahasa',
        curriculum: 'Kurikulum Merdeka',
        cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=500&fit=crop',
        description: 'Tingkatkan kemampuan bahasa Inggris Anda dengan keterampilan menulis dan komunikasi akademik.',
        grade: 'Kelas 12',
        year: 2024
    },
    {
        id: 7,
        title: 'Biologi: Sel dan Biologi Molekuler',
        category: 'Sains',
        curriculum: 'Kurikulum Merdeka',
        cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=500&fit=crop',
        description: 'Memahami kehidupan di tingkat sel dan molekuler dengan bioteknologi modern.',
        grade: 'Kelas 11',
        year: 2024
    },
    {
        id: 8,
        title: 'Ekonomi dan Studi Bisnis',
        category: 'IPS',
        curriculum: 'Kurikulum 2013',
        cover: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=500&fit=crop',
        description: 'Pelajari prinsip ekonomi, dinamika pasar, dan dasar-dasar manajemen bisnis.',
        grade: 'Kelas 11',
        year: 2024
    },
    {
        id: 9,
        title: 'Pancasila dan Pendidikan Kewarganegaraan',
        category: 'PKn',
        curriculum: 'Kurikulum Merdeka',
        cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=500&fit=crop',
        description: 'Memahami nilai-nilai Indonesia, demokrasi, dan tanggung jawab kewarganegaraan.',
        grade: 'Kelas 10',
        year: 2024
    },
    {
        id: 10,
        title: 'Geografi: Fisik dan Manusia',
        category: 'IPS',
        curriculum: 'Kurikulum 2013',
        cover: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=400&h=500&fit=crop',
        description: 'Jelajahi fitur fisik Bumi dan interaksi manusia-lingkungan.',
        grade: 'Kelas 10',
        year: 2024
    },
    {
        id: 11,
        title: 'Ilmu Komputer dan Pemrograman',
        category: 'Teknologi',
        curriculum: 'Kurikulum Merdeka',
        cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=500&fit=crop',
        description: 'Pengenalan pemrograman, algoritma, dan pemikiran komputasional.',
        grade: 'Kelas 11',
        year: 2024
    },
    {
        id: 12,
        title: 'Seni dan Studi Budaya',
        category: 'Seni',
        curriculum: 'Kurikulum 2013',
        cover: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=500&fit=crop',
        description: 'Apresiasi seni Indonesia dan dunia, musik, dan warisan budaya.',
        grade: 'Kelas 10',
        year: 2024
    }
]

function BooksLatestPage() {
    const { t } = useTranslation()
    const searchParams = useSearch({ from: '/__v1/_books/latest' })
    const [searchQuery, setSearchQuery] = useState(searchParams.search || '')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [curriculumFilter, setCurriculumFilter] = useState('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Get unique categories and curricula
    const categories = useMemo(() => {
        const cats = new Set(sampleBooks.map(book => book.category))
        return ['all', ...Array.from(cats)]
    }, [])

    const curricula = useMemo(() => {
        const currs = new Set(sampleBooks.map(book => book.curriculum))
        return ['all', ...Array.from(currs)]
    }, [])

    // Filter books
    const filteredBooks = useMemo(() => {
        return sampleBooks.filter(book => {
            const matchesSearch = searchQuery === '' ||
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.category.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter
            const matchesCurriculum = curriculumFilter === 'all' || book.curriculum === curriculumFilter

            return matchesSearch && matchesCategory && matchesCurriculum
        })
    }, [searchQuery, categoryFilter, curriculumFilter])

    return (
        <div className="min-h-screen bg-background">
            <LandingNavbar />

            <div className="container mx-auto px-4 pt-24 pb-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                            <BookOpen className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                                {t('booksLatest.title')}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {t('booksLatest.subtitle')}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-8 space-y-4"
                >
                    {/* Search Bar */}
                    <div className="flex gap-2 p-2 bg-card/80 backdrop-blur-xl rounded-xl shadow-lg border border-border/50">
                        <div className="flex-1 flex items-center gap-2 px-4">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={t('booksLatest.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Filters and View Toggle */}
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-3">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder={t('booksLatest.filters.category')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('booksLatest.filters.allCategories')}</SelectItem>
                                    {categories.filter(c => c !== 'all').map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={curriculumFilter} onValueChange={setCurriculumFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder={t('booksLatest.filters.curriculum')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('booksLatest.filters.allCurricula')}</SelectItem>
                                    {curricula.filter(c => c !== 'all').map(curr => (
                                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid3x3 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="text-sm text-muted-foreground">
                        {t('booksLatest.showingBooks')} <span className="font-semibold text-foreground">{filteredBooks.length}</span> {t('booksLatest.books')}
                    </div>
                </motion.div>

                {/* Books Grid/List */}
                <div className={viewMode === 'grid'
                    ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                    {filteredBooks.map((book, index) => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            {viewMode === 'grid' ? (
                                <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group overflow-hidden bg-card/50 backdrop-blur-sm">
                                    <div className="relative h-64 overflow-hidden bg-muted">
                                        <img
                                            src={book.cover}
                                            alt={book.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0 shadow-md">
                                                {book.year}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader>
                                        <div className="flex gap-2 mb-2">
                                            <Badge variant="outline">{book.category}</Badge>
                                            <Badge variant="secondary">{book.grade}</Badge>
                                        </div>
                                        <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
                                        <CardDescription className="text-xs">{book.curriculum}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {book.description}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground shadow-md">
                                            {t('booksLatest.viewDetails')}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ) : (
                                <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
                                    <div className="flex gap-4 p-4">
                                        <div className="w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                            <img
                                                src={book.cover}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex gap-2 mb-2">
                                                <Badge variant="outline">{book.category}</Badge>
                                                <Badge variant="secondary">{book.grade}</Badge>
                                                <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0">
                                                    {book.year}
                                                </Badge>
                                            </div>
                                            <h3 className="text-xl font-bold mb-1">{book.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">{book.curriculum}</p>
                                            <p className="text-sm text-muted-foreground mb-4 flex-1">
                                                {book.description}
                                            </p>
                                            <div>
                                                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground shadow-md">
                                                    {t('booksLatest.viewDetails')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* No Results */}
                {filteredBooks.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            {t('booksLatest.noBooks')}
                        </h3>
                        <p className="text-muted-foreground">
                            {t('booksLatest.noBooksSub')}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default BooksLatestPage
