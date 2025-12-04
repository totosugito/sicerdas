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
import uud1945Data from '@/data/constitution/pasal_uud_1945_asli.json';

// Define TypeScript interfaces for our data
interface Ayat {
  id: number;
  isi: string;
}

interface Pasal {
  title: string;
  data: Ayat[];
  bab: string;
}

export const Route = createFileRoute('/_v1/constitution/pasal-uud-1945-asli')({
  component: RouteComponent,
});

function RouteComponent() {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  // Expand/collapse all state
  const [expandedAll, setExpandedAll] = useState(false);

  // Toggle expand/collapse all
  const toggleExpandAll = useCallback(() => {
    setExpandedAll(!expandedAll);
  }, [expandedAll]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
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
    if (!searchTerm.trim()) return uud1945Data;

    return uud1945Data.filter((pasal: Pasal) => {
      const pasalMatch = pasal.title.toLowerCase().includes(searchTerm.toLowerCase());
      const ayatMatch = pasal.data.some(ayat =>
        ayat.isi.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const babMatch = pasal.bab.toLowerCase().includes(searchTerm.toLowerCase());
      return pasalMatch || ayatMatch || babMatch;
    });
  }, [searchTerm]);

  // Count different types of articles
  const counts = {
      pasal: 37,
      aturanPeralihan: 4,
      aturanTambahan: 1
    };

  // Calculate total matching ayat for search summary
  const searchSummary = useMemo(() => {
    if (!searchTerm.trim()) return { ayatCount: 0, pasalCount: 0 };

    let ayatCount = 0;
    filteredData.forEach((pasal: Pasal) => {
      pasal.data.forEach(ayat => {
        if (ayat.isi.toLowerCase().includes(searchTerm.toLowerCase())) {
          ayatCount++;
        }
      });
    });

    return {
      ayatCount,
      pasalCount: filteredData.length
    };
  }, [filteredData, searchTerm]);

  // Filter ayat based on search term for display
  const filterAyat = useCallback((ayatList: Ayat[], searchTerm: string): Ayat[] => {
    if (!searchTerm.trim()) return ayatList;
    return ayatList.filter(ayat => 
      ayat.isi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Hero Section */}
      <section className="relative py-10">
        <div className="flex flex-col gap-2 mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full shadow-sm transform hover:scale-110 transition-transform duration-300">
              <img src="/constitution/images/ic_pancasila.png" alt="UUD 1945" className="w-24 h-24" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Pasal-Pasal UUD1945 (Asli)
          </h1>
          <p className="text-lg text-gray-600 mb-8 mx-auto leading-relaxed dark:text-gray-300">
            Landasan hukum dan konstitusi tertinggi Negara Republik Indonesia
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge className="bg-white hover:bg-gray-50 text-red-600 border-2 border-red-600 px-6 py-2 text-sm font-semibold dark:bg-gray-800 dark:text-red-400 dark:border-red-700 dark:hover:bg-gray-700">
              {counts.pasal} Pasal
            </Badge>
            <Badge className="bg-white hover:bg-gray-50 text-red-600 border-2 border-red-600 px-6 py-2 text-sm font-semibold dark:bg-gray-800 dark:text-red-400 dark:border-red-700 dark:hover:bg-gray-700">
              {counts.aturanPeralihan} Aturan Peralihan
            </Badge>
            <Badge className="bg-white hover:bg-gray-50 text-red-600 border-2 border-red-600 px-6 py-2 text-sm font-semibold dark:bg-gray-800 dark:text-red-400 dark:border-red-700 dark:hover:bg-gray-700">
              {counts.aturanTambahan} Aturan Tambahan
            </Badge>
          </div>
        </div>
      </section>

      <div className='flex flex-col gap-6 w-full'>
        <Separator className="dark:bg-gray-700" />

        {/* Search Section */}
        <section className="py-0">
          <div className="mx-auto">
            <div className="flex flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Cari pasal, ayat, atau bab UUD 1945..."
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
            {searchTerm && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Ditemukan <span className="font-semibold text-red-600 dark:text-red-400">
                  {searchSummary.ayatCount}
                </span> ayat dari <span className="font-semibold text-red-600 dark:text-red-400">{searchSummary.pasalCount}</span> pasal
              </p>
            )}
          </div>
        </section>

        {/* Content Section */}
        <section className="">
          <div className="mx-auto">
            {filteredData.length === 0 ? (
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
                  Tidak ditemukan pasal atau ayat UUD 1945 Asli yang sesuai dengan pencarian "{searchTerm}"
                </p>
                <Button
                  onClick={clearSearch}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Hapus Pencarian
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredData.map((pasal: Pasal) => {
                  const filteredAyat = filterAyat(pasal.data, searchTerm);
                  const matchingAyatCount = searchTerm 
                    ? filteredAyat.length 
                    : pasal.data.length;

                  return (
                    <Card
                      key={pasal.title}
                      className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 dark:shadow-gray-900"
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-white rounded-lg shadow-md border-2 border-red-200 dark:bg-gray-800 dark:border-gray-700">
                            <div className="text-red-600 font-bold text-xl dark:text-red-400 min-w-6 flex justify-center">
                              {pasal.title.replace("Pasal ", "").replace(" (Aturan Peralihan)", "").replace(" (Aturan Tambahan)", "")}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-400 dark:hover:bg-red-600 dark:text-gray-900">
                                {pasal.title.includes("(Aturan Peralihan)") ? "Aturan Peralihan" : 
                                 pasal.title.includes("Aturan Pertambahan") ? "Aturan Tambahan" : "Pasal"}
                              </Badge>
                            </div>
                            <CardTitle className="sm:text-lg text-gray-900 leading-tight dark:text-white">
                              {highlightText(pasal.title, searchTerm)}
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-2 dark:text-gray-300">
                              {pasal.bab} • {
                                searchTerm 
                                  ? `${matchingAyatCount} dari ${pasal.data.length} Ayat${searchTerm && ' yang sesuai'}` 
                                  : `${pasal.data.length} Ayat${searchTerm && ' yang sesuai'}`
                              }
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Accordion key={`${pasal.title}-${expandedAll}`} type="multiple" className="w-full" defaultValue={expandedAll ? [`ayat-${pasal.title}`] : []}>
                          <AccordionItem value={`ayat-${pasal.title}`} className="border-none">
                            <AccordionTrigger className="text-red-700 hover:text-red-800 font-semibold hover:no-underline py-0 dark:text-red-400 dark:hover:text-red-300">
                              <span className="flex items-center gap-2">
                                Lihat Ayat
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="mt-4 space-y-4">
                                {filteredAyat.map((ayat: Ayat) => (
                                  <div
                                    key={ayat.id}
                                    className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-red-100 hover:border-red-300 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
                                  >
                                    <div className="flex-shrink-0">
                                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm dark:bg-red-400 dark:text-gray-900">
                                        {ayat.id}
                                      </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed flex-1 dark:text-gray-300">
                                      {highlightText(ayat.isi, searchTerm)}
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
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}