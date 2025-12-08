import React, { useState, useMemo, useEffect } from 'react';
import { ExpoEvent, EventType, Language } from '../types';
import { MapPin, ExternalLink, X, Clock, Calendar as CalendarIcon, MousePointerClick } from 'lucide-react';
import { TRANSLATIONS } from '../translations';
import { CategoryIcon } from './CategoryIcon';

interface CalendarViewProps {
  events: ExpoEvent[];
  lang: Language;
}

const DAYS_OF_WEEK = {
  zh: ['日', '一', '二', '三', '四', '五', '六'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  kr: ['일', '월', '화', '수', '목', '금', '토']
};

const MONTH_NAMES = {
  zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  kr: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
};

// Use lighter pastel colors for calendar chips to reduce visual noise
// Accessibility: Switched text to darker shades (800) to ensure WCAG AA contrast against light backgrounds
const getTypeColorClass = (type: EventType) => {
  switch (type) {
    case EventType.Forum: return 'bg-blue-50 text-blue-800 border border-blue-100 hover:bg-blue-100';
    case EventType.Lecture: return 'bg-indigo-50 text-indigo-800 border border-indigo-100 hover:bg-indigo-100';
    case EventType.Workshop: return 'bg-amber-50 text-amber-800 border border-amber-100 hover:bg-amber-100';
    case EventType.Tour: return 'bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100';
    case EventType.Market: return 'bg-rose-50 text-rose-800 border border-rose-100 hover:bg-rose-100';
    case EventType.Performance: return 'bg-purple-50 text-purple-800 border border-purple-100 hover:bg-purple-100';
    case EventType.Discussion: return 'bg-teal-50 text-teal-800 border border-teal-100 hover:bg-teal-100';
    default: return 'bg-stone-100 text-stone-800 border border-stone-200 hover:bg-stone-200';
  }
};

const getTypeDotColor = (type: EventType) => {
  switch (type) {
    case EventType.Forum: return 'bg-blue-600';
    case EventType.Lecture: return 'bg-indigo-600';
    case EventType.Workshop: return 'bg-amber-600';
    case EventType.Tour: return 'bg-emerald-600';
    case EventType.Market: return 'bg-rose-600';
    case EventType.Performance: return 'bg-purple-600';
    case EventType.Discussion: return 'bg-teal-600';
    default: return 'bg-stone-600';
  }
};

export const CalendarView: React.FC<CalendarViewProps> = ({ events, lang }) => {
  // Default to December 2025 as that's when the expo is
  const [currentDate] = useState(new Date(2025, 11, 1)); 
  const [selectedDay, setSelectedDay] = useState<{date: Date, events: ExpoEvent[]} | null>(null);
  const t = TRANSLATIONS[lang];

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDay(null);
      }
    };

    if (selectedDay) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDay]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // Group events by day of month (1-31)
  const eventsByDay = useMemo(() => {
    const map: Record<number, ExpoEvent[]> = {};
    events.forEach(event => {
      // Parse ISO date string (2025-12-12T19:30 or 2025-12-12)
      const dateParts = event.dateSort.split('T')[0].split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // 0-indexed
      const day = parseInt(dateParts[2]);

      if (year === currentDate.getFullYear() && month === currentDate.getMonth()) {
        if (!map[day]) map[day] = [];
        map[day].push(event);
      }
    });
    return map;
  }, [events, currentDate]);

  const handleDayClick = (day: number, dayEvents: ExpoEvent[]) => {
    if (dayEvents.length > 0) {
      // Sort events by time (dateSort) so they appear chronologically in the modal
      const sortedEvents = [...dayEvents].sort((a, b) => a.dateSort.localeCompare(b.dateSort));

      setSelectedDay({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
        events: sortedEvents
      });
    }
  };

  // Generate grid cells
  const gridCells = [];
  
  // Padding for previous month
  for (let i = 0; i < firstDay; i++) {
    gridCells.push(<div key={`pad-${i}`} className="bg-[#fcfbf9] border border-[#e6e2d6] min-h-[100px] md:min-h-[160px]"></div>);
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = eventsByDay[day] || [];
    const hasEvents = dayEvents.length > 0;
    
    // Determine which events to show on desktop
    const MAX_VISIBLE_EVENTS = 3;
    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
    const hiddenCount = dayEvents.length - MAX_VISIBLE_EVENTS;

    gridCells.push(
      <div 
        key={`day-${day}`} 
        className={`relative border border-[#e6e2d6] min-h-[100px] md:min-h-[160px] p-1 md:p-2 flex flex-col transition-all duration-200 group overflow-hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 ${hasEvents ? 'bg-white hover:bg-orange-50/50 cursor-pointer hover:shadow-md hover:border-orange-200 hover:z-10' : 'bg-white'}`}
        onClick={() => handleDayClick(day, dayEvents)}
        role={hasEvents ? 'button' : 'gridcell'}
        tabIndex={hasEvents ? 0 : -1}
        aria-label={hasEvents ? `${day}日, 有 ${dayEvents.length} 個活動` : `${day}日`}
        onKeyDown={(e) => {
          if (hasEvents && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleDayClick(day, dayEvents);
          }
        }}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${hasEvents ? 'bg-stone-100 text-stone-900 group-hover:bg-orange-100 group-hover:text-orange-800' : 'text-stone-500'}`}>
            {day}
          </span>
          {hasEvents && (
             <MousePointerClick className="w-4 h-4 text-stone-300 md:hidden opacity-50" aria-hidden="true" />
          )}
        </div>
        
        {/* Mobile View: Clear Count Badge */}
        <div className="md:hidden flex-1 flex flex-col items-center justify-center gap-1" aria-hidden="true">
          {hasEvents && (
            <>
              <div className="flex flex-col items-center">
                 <span className="text-xl font-black text-orange-600 leading-none tracking-tight">
                   {dayEvents.length}
                 </span>
                 <span className="text-[10px] font-bold text-stone-400 uppercase">
                   Events
                 </span>
              </div>
              <div className="flex gap-1 mt-1 justify-center flex-wrap px-1">
                {dayEvents.slice(0, 4).map((e, i) => (
                  <div key={`${e.id}-dot`} className={`w-1.5 h-1.5 rounded-full ${getTypeDotColor(e.type)}`} />
                ))}
                {dayEvents.length > 4 && <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />}
              </div>
            </>
          )}
        </div>

        {/* Desktop View: List */}
        <div className="hidden md:flex flex-col gap-1.5 flex-1 w-full" aria-hidden="true">
          {visibleEvents.map(e => (
            <div 
              key={e.id} 
              className={`text-[11px] truncate px-2 py-1 rounded-md leading-snug flex items-center gap-1.5 shadow-sm transition-all ${getTypeColorClass(e.type)} ${e.isFull ? 'opacity-60 grayscale' : ''}`}
              title={`${e.title} @ ${e.venueGroup}`}
            >
              <CategoryIcon type={e.type} className="w-3 h-3 shrink-0 opacity-70" />
              <span className="truncate font-semibold">{e.title}</span>
            </div>
          ))}
          
          {hiddenCount > 0 && (
            <div className="mt-auto text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 rounded px-2 py-1 text-center flex items-center justify-center gap-1 hover:bg-stone-200 transition-colors">
               <span>+{hiddenCount} more</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-[#e6e2d6] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center p-4 bg-[#f9f8f4] border-b border-[#e6e2d6]">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-orange-600" aria-hidden="true" />
            {MONTH_NAMES[lang][currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 bg-[#f5f5dc] border-b border-[#e6e2d6]">
          {DAYS_OF_WEEK[lang].map((day, idx) => (
            <div key={idx} className="py-2.5 text-center text-xs md:text-sm font-bold text-stone-600 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 bg-stone-50">
          {gridCells}
        </div>
        
        {/* Mobile Hint */}
        <div className="md:hidden p-3 text-xs text-stone-500 text-center border-t border-[#e6e2d6] bg-[#f9f8f4]">
          Tap a day to view event details
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDay && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setSelectedDay(null)}
            aria-hidden="true"
          />
          
          {/* Modal Content */}
          <div 
            className="bg-white w-full sm:max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col relative animate-in slide-in-from-bottom-10 duration-300 sm:duration-200"
          >
             {/* Modal Header */}
             <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-[#f9f8f4] rounded-t-2xl sm:rounded-t-xl shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="font-bold text-lg">{selectedDay.date.getDate()}</span>
                  </div>
                  <div>
                    <h3 id="modal-title" className="text-lg font-bold text-stone-800 leading-tight">
                      {MONTH_NAMES[lang][selectedDay.date.getMonth()]} {selectedDay.date.getDate()}
                    </h3>
                    <p className="text-xs text-stone-500 font-bold uppercase">
                      {selectedDay.events.length} Events
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
             </div>
             
             {/* Modal Body (Event List) */}
             <div className="overflow-y-auto p-4 space-y-4">
                {selectedDay.events.map(event => (
                  <article 
                    key={`modal-${event.id}`} 
                    className="group relative bg-white border border-[#e6e2d6] rounded-xl p-4 hover:border-orange-200 hover:shadow-md transition-all"
                  >
                     <div className="flex items-start justify-between gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${event.isFull ? 'bg-red-50 text-red-700 border-red-100' : 'bg-stone-50 border-stone-100 text-stone-600'}`}>
                           <CategoryIcon type={event.type} className="w-3 h-3" />
                           {t.types[event.type]}
                        </span>
                        {event.isFull && <span className="text-xs font-bold text-red-600">{t.full}</span>}
                     </div>
                     
                     <h4 className="font-bold text-stone-900 text-lg mb-2 leading-tight">
                       {event.title}
                     </h4>

                     <div className="space-y-1.5 text-sm text-stone-600 mb-4">
                        <div className="flex items-center gap-2">
                           <Clock className="w-4 h-4 text-orange-600/70" aria-hidden="true" />
                           <span className="font-medium">{event.dateDisplay}</span>
                        </div>
                         <div className="flex items-center gap-2">
                           <MapPin className="w-4 h-4 text-orange-600/70" aria-hidden="true" />
                           <span>{event.venueGroup} {event.locationDetail ? `• ${event.locationDetail}` : ''}</span>
                        </div>
                     </div>

                     {event.link && !event.isFull && (
                       <a 
                         href={event.link} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         aria-label={`${t.register} - ${event.title}`}
                         className="flex items-center justify-center w-full py-2 bg-stone-800 text-white text-sm font-bold rounded-lg hover:bg-stone-900 transition-colors gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600"
                       >
                         <span>{t.register}</span>
                         <ExternalLink className="w-3 h-3" aria-hidden="true" />
                       </a>
                     )}
                     
                     {event.isFull && (
                       <button disabled className="w-full py-2 bg-stone-100 text-stone-400 text-sm font-bold rounded-lg cursor-not-allowed">
                         {t.full}
                       </button>
                     )}
                  </article>
                ))}
             </div>
          </div>
        </div>
      )}
    </>
  );
};