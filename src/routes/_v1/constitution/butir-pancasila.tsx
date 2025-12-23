import React, { useState, useMemo, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import butirPancasilaData from '@/data/constitution/butir_pancasila.json';

// Define TypeScript interfaces for our data
interface ButirItem {
  id: number;
  isi: string;
}

interface PancasilaItem {
  id: number;
  title: string;
  sila: string;
  image: string;
  data: ButirItem[];
}

interface FilteredPancasilaItem extends PancasilaItem {
  originalDataCount?: number;
}

// Define color map for cards
const colorMap = {
  1: 'from-red-50 to-white border-red-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700',
  2: 'from-white to-red-50 border-red-200 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700',
  3: 'from-red-50 to-white border-red-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700',
  4: 'from-white to-red-50 border-red-200 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700',
  5: 'from-red-50 to-white border-red-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700'
};

// Sub-component for displaying a single Pancasila item
const PancasilaCard: React.FC<{
  sila: FilteredPancasilaItem;
  searchTerm: string;
  isExpanded: boolean;
  iconMap: Record<number, React.ReactNode>;
  highlightText: (text: string, query: string) => React.ReactNode;
}> = ({ sila, searchTerm, isExpanded, iconMap, highlightText }) => {

  // Filter butir based on search term for display
  const filteredButir = useMemo(() => {
    if (!searchTerm.trim()) return sila.data;
    return sila.data.filter(butir => 
      butir.isi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sila.data, searchTerm]);

  // Use originalDataCount if available, otherwise use current data length
  const silaCount = sila.originalDataCount ?? sila.data.length;
  const matchingButirCount = searchTerm ? filteredButir.length : silaCount;

  return (
    <Card
      className={`bg-gradient-to-br ${colorMap[sila.id as keyof typeof colorMap]} border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 dark:shadow-gray-900`}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg shadow-md border-2 border-red-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-red-600 dark:text-red-400">
              {iconMap[sila.id]}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge className={'bg-red-600 text-white hover:bg-red-700 dark:bg-red-400 dark:hover:bg-red-600 dark:text-gray-900'}>
                Sila {sila.id}
              </Badge>
            </div>
            <CardTitle className="sm:text-lg text-gray-900 leading-tight dark:text-white">
              {highlightText(sila.sila, searchTerm)}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2 dark:text-gray-300">
              {searchTerm 
                ? `${matchingButirCount} dari ${silaCount} Butir yang sesuai` 
                : `${silaCount} Butir Pengamalan`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue={isExpanded ? `butir-${sila.id}` : undefined}>
          <AccordionItem value={`butir-${sila.id}`} className="border-none">
            <AccordionTrigger className="text-red-700 hover:text-red-800 font-semibold hover:no-underline py-0 dark:text-red-400 dark:hover:text-red-300">
              <span className="flex items-center gap-2">
                Lihat Butir Pengamalan
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-4 space-y-4">
                {filteredButir.map((item: ButirItem) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-red-100 hover:border-red-300 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm dark:bg-red-400 dark:text-gray-900">
                        {item.id}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed flex-1 dark:text-gray-300">
                      {highlightText(item.isi, searchTerm)}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

// Sub-component for the hero section
const HeroSection: React.FC = () => (
  <section className="relative py-6">
    <div className="flex flex-col gap-2 mx-auto text-center">
      <div className="mb-6 flex justify-center">
        <div className="p-4 rounded-full shadow-sm transform hover:scale-110 transition-transform duration-300">
          <img src="/constitution/images/ic_pancasila.png" alt="Pancasila" className="w-24 h-24" />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        Butir-Butir Pancasila
      </h1>
      <p className="text-lg text-gray-600 mb-8 mx-auto leading-relaxed dark:text-gray-300">
        Pedoman hidup berbangsa dan bernegara yang mengandung nilai-nilai luhur bangsa Indonesia
      </p>
      <div className="flex items-center justify-center gap-4">
        <Badge className="bg-white hover:bg-gray-50 text-red-600 border-2 border-red-600 px-6 py-2 text-sm font-semibold dark:bg-gray-800 dark:text-red-400 dark:border-red-700 dark:hover:bg-gray-700">
          5 Sila
        </Badge>
        <Badge className="bg-white hover:bg-gray-50 text-red-600 border-2 border-red-600 px-6 py-2 text-sm font-semibold dark:bg-gray-800 dark:text-red-400 dark:border-red-700 dark:hover:bg-gray-700">
          45 Butir Pengamalan
        </Badge>
      </div>
    </div>
  </section>
);

// Sub-component for the search section
const SearchSection: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  expandedAll: boolean;
  toggleExpandAll: () => void;
  clearSearch: () => void;
  searchSummary?: { butirCount: number; silaCount: number };
}> = ({ searchTerm, setSearchTerm, expandedAll, toggleExpandAll, clearSearch, searchSummary }) => (
  <section className="py-0">
    <div className="mx-auto">
      <div className="flex flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Cari butir Pancasila..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-12 h-10 text-lg border-2 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 dark:border-gray-700 dark:focus:border-red-500 dark:focus:ring-red-900/30 dark:bg-gray-800 dark:text-white"
          />
          {searchTerm && (
            <Button
              onClick={clearSearch}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors dark:hover:text-red-400"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={toggleExpandAll}
            size="lg"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 dark:bg-red-700 dark:hover:bg-red-800"
          >
            {expandedAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Tutup Semua
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Buka Semua
              </>
            )}
          </Button>
        </div>
      </div>
      {searchTerm && searchSummary && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Ditemukan <span className="font-semibold text-red-600 dark:text-red-400">
            {searchSummary.butirCount}
          </span> butir dari <span className="font-semibold text-red-600 dark:text-red-400">{searchSummary.silaCount}</span> sila
        </p>
      )}
    </div>
  </section>
);

// Sub-component for the empty state
const EmptyState: React.FC<{ searchTerm: string; clearSearch: () => void }> = ({ searchTerm, clearSearch }) => (
  <div className="text-center py-10">
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
    <Button
      onClick={clearSearch}
      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 dark:bg-red-700 dark:hover:bg-red-800"
    >
      Hapus Pencarian
    </Button>
  </div>
);

export const Route = createFileRoute('/_v1/constitution/butir-pancasila')({
  component: RouteComponent,
});

function RouteComponent() {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  // Expand/collapse all state
  const [expandedAll, setExpandedAll] = useState(false);

  // Toggle expand/collapse all
  const toggleExpandAll = useCallback(() => {
    setExpandedAll(prev => !prev);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Create iconMap using image paths from JSON data
  const iconMap = useMemo(() => {
    const map: Record<number, React.ReactNode> = {};
    butirPancasilaData.forEach((item: PancasilaItem) => {
      map[item.id] = <img src={item.image} alt={`Sila ${item.id}`} className="w-8 h-8" />;
    });
    return map;
  }, []);

  // Highlight text for search results
  const highlightText = useCallback((text: string, query: string) => {
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
  }, []);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return butirPancasilaData;

    const query = searchTerm.toLowerCase();
    return butirPancasilaData
      .map((sila: PancasilaItem) => {
        const silaLower = sila.sila.toLowerCase();
        const silaMatch = silaLower.includes(query);
        const matchingButir = sila.data.filter((butir: ButirItem) =>
          butir.isi.toLowerCase().includes(query)
        );

        if (silaMatch || matchingButir.length > 0) {
          return {
            ...sila,
            data: matchingButir.length > 0 ? matchingButir : sila.data,
            // Preserve original count
            originalDataCount: sila.data.length
          };
        }
        return null;
      })
      .filter((sila) => sila !== null) as FilteredPancasilaItem[];
  }, [searchTerm]);

  // Calculate total matching butir for search summary
  const searchSummary = useMemo(() => {
    if (!searchTerm.trim()) return { butirCount: 0, silaCount: 0 };

    let butirCount = 0;
    
    // Count how many silas have matching butir items
    // Using the same logic as in the filtering to ensure consistency
    const silaWithMatches = butirPancasilaData.reduce((count, sila) => {
      const query = searchTerm.toLowerCase();
      const silaLower = sila.sila.toLowerCase();
      const silaMatch = silaLower.includes(query);
      const hasMatchingButir = sila.data.some(butir => 
        butir.isi.toLowerCase().includes(query)
      );
      
      if (silaMatch || hasMatchingButir) {
        // Count matching butir items in this sila
        sila.data.forEach(butir => {
          if (butir.isi.toLowerCase().includes(query)) {
            butirCount++;
          }
        });
        
        return count + 1;
      }
      return count;
    }, 0);

    return {
      butirCount,
      // Show the count of silas that have matching butir items
      silaCount: silaWithMatches
    };
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-6 w-full pb-6">
      <HeroSection />
      
      <div className='flex flex-col gap-6 w-full'>
        <Separator className="dark:bg-gray-700" />
        
        <SearchSection 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          expandedAll={expandedAll}
          toggleExpandAll={toggleExpandAll}
          clearSearch={clearSearch}
          searchSummary={searchSummary}
        />

        {/* Content Section */}
        <section className="">
          <div className="mx-auto">
            {filteredData.length === 0 ? (
              <EmptyState searchTerm={searchTerm} clearSearch={clearSearch} />
            ) : (
              <div className="space-y-8">
                {filteredData.map((sila) => (
                  sila && (
                  <PancasilaCard
                    key={sila.id}
                    sila={sila}
                    searchTerm={searchTerm}
                    isExpanded={expandedAll}
                    iconMap={iconMap}
                    highlightText={highlightText}
                  />
                )))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}