import React, { useState, useRef, useEffect } from 'react';
import { EventType, ViewMode, Language } from '../types';
import { Search, MapPin, ChevronDown, ChevronUp, Grid3X3, Building2, Check } from 'lucide-react';
import { TRANSLATIONS } from '../translations';
import { CategoryIcon } from './CategoryIcon';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedType: EventType | 'All';
  setSelectedType: (t: EventType | 'All') => void;
  selectedVenue: string;
  setSelectedVenue: (v: string) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  uniqueVenues: string[];
  lang: Language;
}

const getCategoryIconColor = (type: EventType) => {
  // Enhanced for WCAG AA Contrast compliance against white background
  switch (type) {
    case EventType.Forum: return 'text-blue-700';
    case EventType.Lecture: return 'text-indigo-700';
    case EventType.Workshop: return 'text-amber-700';
    case EventType.Tour: return 'text-emerald-700';
    case EventType.Market: return 'text-rose-700';
    case EventType.Performance: return 'text-purple-700';
    case EventType.Discussion: return 'text-teal-700';
    case EventType.Exhibition: return 'text-cyan-700';
    case EventType.Other: return 'text-slate-700';
    default: return 'text-stone-700';
  }
};

export const FilterBar: React.FC<FilterBarProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedType, 
  setSelectedType,
  selectedVenue,
  setSelectedVenue,
  viewMode,
  setViewMode,
  uniqueVenues,
  lang
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVenueOpen, setIsVenueOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const eventTypes = Object.values(EventType);
  const t = TRANSLATIONS[lang];

  // Handle click outside to close custom dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsVenueOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="sticky top-0 z-20 bg-[#f5f5dc]/95 backdrop-blur-md border-b border-[#e6e2d6] shadow-sm py-4 px-4 mb-6" role="search" aria-label="Event filters">
      <div className="max-w-7xl mx-auto space-y-4">
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search & Venue Filter Group */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-grow max-w-2xl">
            {/* Text Search */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-500" aria-hidden="true" title={t.searchPlaceholder} />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-[#d6d3c8] rounded-lg leading-5 bg-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 sm:text-sm transition-all text-stone-900 shadow-sm"
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Custom Venue Dropdown */}
            <div className="relative w-full sm:w-64 shrink-0" ref={dropdownRef}>
              <button
                type="button"
                className="relative w-full pl-10 pr-10 py-2 border border-[#d6d3c8] rounded-lg leading-5 bg-white text-left focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 sm:text-sm transition-all text-stone-900 shadow-sm flex items-center gap-2"
                onClick={() => setIsVenueOpen(!isVenueOpen)}
                aria-haspopup="listbox"
                aria-expanded={isVenueOpen}
                aria-label={t.venuePlaceholder}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-stone-500" aria-hidden="true" />
                </div>
                <span className="block truncate">
                  {selectedVenue === 'All' ? t.venuePlaceholder : selectedVenue}
                </span>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className={`h-4 w-4 text-stone-500 transition-transform ${isVenueOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </div>
              </button>

              {/* Dropdown Options */}
              {isVenueOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-100">
                  <ul role="listbox" aria-label={t.venuePlaceholder}>
                    {/* 'All' Option */}
                    <li
                      className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-orange-50 transition-colors ${selectedVenue === 'All' ? 'text-orange-900 bg-orange-50' : 'text-stone-900'}`}
                      role="option"
                      aria-selected={selectedVenue === 'All'}
                      onClick={() => {
                        setSelectedVenue('All');
                        setIsVenueOpen(false);
                      }}
                    >
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-stone-400 mr-3 shrink-0" aria-hidden="true" />
                        <span className={`block truncate ${selectedVenue === 'All' ? 'font-bold' : 'font-normal'}`}>
                          {t.venuePlaceholder}
                        </span>
                      </div>
                      {selectedVenue === 'All' && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-orange-600">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </li>

                    {/* Venue Options */}
                    {uniqueVenues.map((venue) => (
                      <li
                        key={venue}
                        className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-orange-50 transition-colors ${selectedVenue === venue ? 'text-orange-900 bg-orange-50' : 'text-stone-900'}`}
                        role="option"
                        aria-selected={selectedVenue === venue}
                        onClick={() => {
                          setSelectedVenue(venue);
                          setIsVenueOpen(false);
                        }}
                      >
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-stone-400 mr-3 shrink-0" aria-hidden="true" />
                          <span className={`block truncate ${selectedVenue === venue ? 'font-bold' : 'font-normal'}`}>
                            {venue}
                          </span>
                        </div>
                        {selectedVenue === venue && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-orange-600">
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Controls: All Events & Calendar */}
          <div className="w-full md:w-auto flex justify-center md:justify-start gap-3">
             {/* All Events Button - Moved to top row */}
             <button
              type="button"
              onClick={() => setSelectedType('All')}
              aria-pressed={selectedType === 'All'}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500 ${
                selectedType === 'All' 
                  ? 'bg-stone-800 text-white border-stone-800' 
                  : 'bg-white text-stone-700 border-[#d6d3c8] hover:bg-stone-50'
              }`}
            >
              <CategoryIcon type="All" className={`w-4 h-4 ${selectedType === 'All' ? 'text-white' : 'text-stone-900'}`} />
              <span className="inline">{t.allEvents}</span>
            </button>

            {/* Calendar Button */}
             <button
              type="button"
              onClick={() => setViewMode(viewMode === 'calendar' ? 'venue' : 'calendar')}
              aria-pressed={viewMode === 'calendar'}
              title={t.viewCalendar}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500 ${
                viewMode === 'calendar' 
                  ? 'bg-stone-800 text-white border-stone-800' 
                  : 'bg-white text-stone-700 border-[#d6d3c8] hover:bg-stone-50'
              }`}
            >
              <Grid3X3 className="w-4 h-4" aria-hidden="true" />
              <span className="inline">{t.viewCalendar}</span>
            </button>
          </div>
        </div>

        {/* Category Chips Container */}
        <div className="flex gap-3 items-start" role="group" aria-label="Category Filters">
          <div 
            className={`
              flex-1 flex gap-2 transition-all duration-300 ease-in-out
              ${isExpanded 
                ? 'flex-wrap' 
                : 'overflow-x-auto pb-2 scrollbar-hide'
              }
            `}
          >
            {/* Removed 'All' button from here */}
            {eventTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                aria-pressed={selectedType === type}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors border shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500 ${
                  selectedType === type 
                    ? 'bg-stone-800 text-white border-stone-800' 
                    : 'bg-white text-stone-700 border-[#d6d3c8] hover:bg-stone-50'
                }`}
              >
                <CategoryIcon 
                  type={type} 
                  className={`w-4 h-4 ${selectedType === type ? 'text-white' : getCategoryIconColor(type)}`} 
                />
                {t.types[type]}
              </button>
            ))}
          </div>
          
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0 p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500"
            title={isExpanded ? t.collapseCategories : t.expandCategories}
            aria-label={isExpanded ? t.collapseCategories : t.expandCategories}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};