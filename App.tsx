

import React, { useState, useMemo, useEffect } from 'react';
import { FilterBar } from './components/FilterBar';
import { EventCard } from './components/EventCard';
import { CalendarView } from './components/CalendarView';
import { ScrollToTop } from './components/ScrollToTop';
import { EXPO_DATA } from './constants';
import { EventType, ViewMode, ExpoEvent, Language } from './types';
import { Info, MapPin } from 'lucide-react';
import { TRANSLATIONS } from './translations';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'All'>('All');
  const [selectedVenue, setSelectedVenue] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('venue');
  const [lang, setLang] = useState<Language>('zh');

  // Accessibility: Update document language
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : lang === 'kr' ? 'ko' : 'en';
  }, [lang]);

  // Extract unique venues
  const uniqueVenues = useMemo(() => {
    const venues = new Set(EXPO_DATA.map(e => e.venueGroup));
    return Array.from(venues);
  }, []);

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return EXPO_DATA.filter((event) => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venueGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.locationDetail?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'All' || event.type === selectedType;
      
      const matchesVenue = selectedVenue === 'All' || event.venueGroup === selectedVenue;

      return matchesSearch && matchesType && matchesVenue;
    });
  }, [searchTerm, selectedType, selectedVenue]);

  // Grouping Logic based on ViewMode
  const groupedEvents = useMemo<Record<string, ExpoEvent[]>>(() => {
    if (viewMode === 'venue') {
      const groups: Record<string, ExpoEvent[]> = {};
      filteredEvents.forEach(event => {
        if (!groups[event.venueGroup]) groups[event.venueGroup] = [];
        groups[event.venueGroup].push(event);
      });
      return groups;
    } 
    
    if (viewMode === 'date') {
      // Sort by date string
      const sorted = [...filteredEvents].sort((a, b) => a.dateSort.localeCompare(b.dateSort));
      // Group by specific date or "Others/Multi-day"
      const groups: Record<string, ExpoEvent[]> = {};
      sorted.forEach(event => {
        // Simple extraction of the date part (e.g., 2024-12-13) for the key
        const label = event.dateDisplay.includes('多場次') || event.dateDisplay.includes('-') 
          ? '多日/連續活動' 
          : event.dateDisplay;
        
        // Use a sorting key for the map but display label for UI
        const groupKey = label; 
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(event);
      });
      return groups;
    }

    if (viewMode === 'type') {
      const groups: Record<string, ExpoEvent[]> = {};
      filteredEvents.forEach(event => {
        const typeLabel = TRANSLATIONS[lang].types[event.type] || event.type;
        if (!groups[typeLabel]) groups[typeLabel] = [];
        groups[typeLabel].push(event);
      });
      return groups;
    }

    return {};
  }, [filteredEvents, viewMode, lang]);

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-[#f5f5dc] flex flex-col font-sans text-stone-900">
      {/* Header */}
      <header className="bg-white border-b border-[#e6e2d6] pt-8 pb-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto relative">
          
          {/* Language Switcher */}
          <div 
            className="absolute top-0 right-0 flex gap-2" 
            role="group" 
            aria-label="Select Language"
          >
            <button 
              onClick={() => setLang('zh')}
              aria-pressed={lang === 'zh'}
              aria-label="Traditional Chinese"
              title="Traditional Chinese"
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${lang === 'zh' ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
            >
              繁中
            </button>
            <button 
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              aria-label="English"
              title="English"
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${lang === 'en' ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('kr')}
              aria-pressed={lang === 'kr'}
              aria-label="Korean"
              title="Korean"
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${lang === 'kr' ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
            >
              한국어
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2 text-stone-600 font-bold tracking-wide uppercase text-sm mt-4 md:mt-0">
            <MapPin className="w-4 h-4 text-orange-700" aria-hidden="true" title="Chiayi City" />
            <span>Chiayi City Expo</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-4 tracking-tight">
            {t.title}
          </h1>
          
          <div className="space-y-1.5 border-l-4 border-orange-400 pl-4 py-1">
            <p className="text-stone-800 text-lg font-medium">
              {t.createdText} 
              <a 
                href="https://www.facebook.com/ChiayiEvents/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={`${t.createdBy} Facebook Page`}
                className="font-bold text-orange-700 hover:text-orange-900 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-1"
              >
                {t.createdBy}
              </a> 
              {' 和 '}
              <a
                href="https://portaly.cc/abichangtw"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abi Chang personal site"
                className="font-bold text-orange-700 hover:text-orange-900 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-1"
              >
                Abi Chang
              </a>
              {t.createdSuffix}
            </p>
            <p className="text-stone-600 text-base">
              {t.sourceText} 
              <a 
                href="https://www.facebook.com/chiayicityexpo2025" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={`${t.sourceName} Facebook Page`}
                className="hover:text-stone-800 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 rounded px-1"
              >
                {t.sourceName}
              </a>
            </p>
            <a 
              href={t.eventMapUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-blue-600 font-bold text-base hover:opacity-70 hover:underline transition-colors mt-1 focus:outline-none focus:ring-2 focus:ring-stone-500 rounded px-1 w-fit"
            >
              {t.eventMap}
            </a>
          </div>
        </div>
      </header>

      {/* Controls */}
      <FilterBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedVenue={selectedVenue}
        setSelectedVenue={setSelectedVenue}
        viewMode={viewMode}
        setViewMode={setViewMode}
        uniqueVenues={uniqueVenues}
        lang={lang}
      />

      {/* Main Content */}
      <main className="flex-grow px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Calendar View Logic */}
          {viewMode === 'calendar' ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CalendarView events={filteredEvents} lang={lang} />
             </div>
          ) : (
            <>
              {Object.keys(groupedEvents).length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#e8e4dc] mb-4">
                    <Info className="w-8 h-8 text-stone-500" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-700">{t.noEvents}</h3>
                  <p className="text-stone-600">{t.noEventsDesc}</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {(Object.entries(groupedEvents) as [string, ExpoEvent[]][]).map(([groupTitle, events]) => (
                    <section key={groupTitle} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-4 mb-6 sticky top-[180px] md:top-[128px] z-10 py-2 bg-[#f5f5dc]/95 backdrop-blur-sm -mx-2 px-2">
                        <h2 className="text-2xl font-bold text-stone-800 relative pl-4">
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-stone-800 rounded-r-md"></span>
                          {groupTitle}
                        </h2>
                        <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-[#e8e4dc] text-stone-700" aria-label={`${events.length} events`}>
                          {events.length}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                          <EventCard key={event.id} event={event} lang={lang} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* Scroll To Top Button */}
      <ScrollToTop />

      {/* Footer */}
      <footer className="bg-[#e8e4dc] border-t border-[#d6d3c8] py-8 px-4 text-center">
        <p className="text-stone-600 text-sm">
          {t.footerPrefix}
          <a 
            href={t.officialNewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-stone-800 transition-colors mx-1 font-bold focus:outline-none focus:ring-2 focus:ring-stone-500 rounded"
          >
            {t.sourceName}
          </a>
          {t.footerSuffix}
        </p>
      </footer>
    </div>
  );
};

export default App;
