import React, { useState } from 'react';
import { EventType, ExpoEvent, Language } from '../types';
import { Calendar, Check, ExternalLink, Instagram, MapPin, Share2 } from 'lucide-react';
import { TRANSLATIONS } from '../translations';
import { CategoryIcon } from './CategoryIcon';

interface EventCardProps {
    event: ExpoEvent;
    lang: Language;
}

const getBadgeColor = (type: EventType) => {
    // Using darker text shades (800) for better contrast ratio (aiming for >4.5:1, ideally >7:1)
    switch (type) {
        case EventType.Forum:
            return 'bg-blue-50 text-blue-800 border-blue-200';
        case EventType.Lecture:
            return 'bg-indigo-50 text-indigo-800 border-indigo-200';
        case EventType.Workshop:
            return 'bg-amber-50 text-amber-800 border-amber-200';
        case EventType.Tour:
            return 'bg-emerald-50 text-emerald-800 border-emerald-200';
        case EventType.Market:
            return 'bg-rose-50 text-rose-800 border-rose-200';
        case EventType.Performance:
            return 'bg-purple-50 text-purple-800 border-purple-200';
        case EventType.Discussion:
            return 'bg-teal-50 text-teal-800 border-teal-200';
        default:
            return 'bg-stone-100 text-stone-800 border-stone-200';
    }
};

export const EventCard: React.FC<EventCardProps> = ({ event, lang }) => {
    const t = TRANSLATIONS[lang];
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        // Construct share data
        const shareText = `[320+1] ${event.title}\n時間: ${event.dateDisplay}\n地點: ${event.venueGroup}${event.locationDetail ? ` (${event.locationDetail})` : ''}\n${event.link || ''}`;

        const shareData = {
            title: event.title,
            text: shareText,
            url: event.link || window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled or share failed, ignore
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy to clipboard');
            }
        }
    };

    return (
        <article
            className={`relative bg-white rounded-xl shadow-sm border border-[#e6e2d6] p-5 flex flex-col h-full hover:shadow-md transition-shadow duration-200 hover:border-orange-200 ${event.isFull ? 'bg-stone-50' : ''}`}
            aria-labelledby={`event-title-${event.id}`}
        >

            {/* Share Button - Only show if there is a link (Register/Details) */}
            {event.link && (
                <button
                    onClick={handleShare}
                    className="absolute top-4 right-4 p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all z-10 focus:outline-none focus:ring-2 focus:ring-stone-500"
                    title={copied ? t.copied : t.share}
                    aria-label={copied ? t.copied : t.share}
                >
                    {copied ? <Check className="w-5 h-5 text-green-700" aria-hidden="true" /> :
                        <Share2 className="w-5 h-5" aria-hidden="true" />}
                </button>
            )}

            {/* Header Badges */}
            <div className="flex flex-wrap gap-2 mb-3 pr-8">
        <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border ${getBadgeColor(event.type)}`}>
          <CategoryIcon type={event.type} className="w-3.5 h-3.5" aria-hidden="true" />
            {t.types[event.type] || event.type}
        </span>
                {event.isFull && (
                    <span
                        className="px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            {t.full}
          </span>
                )}
                {event.tags?.map(tag => (
                    <span key={tag}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
            {tag}
          </span>
                ))}
            </div>

            {/* Content */}
            <h3 id={`event-title-${event.id}`}
                className="text-xl font-bold text-stone-900 mb-3 leading-tight tracking-tight">
                {event.title}
            </h3>

            {event.description && (
                <div
                    className="mb-4 text-sm text-stone-800 bg-[#f9f8f4] p-3 rounded-lg border border-[#e6e2d6] leading-relaxed font-medium whitespace-pre-line">
                    {event.description}
                </div>
            )}

            <div className="space-y-3 mt-auto text-sm text-stone-700">
                <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 mt-0.5 text-orange-700 shrink-0" aria-hidden="true"
                              title={t.viewDate} />
                    <span className="sr-only">{t.dateLabel}: </span>
                    <span className="font-medium">{event.dateDisplay}</span>
                </div>

                {/* Only show location detail if it's not redundant with the section header */}
                <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 text-orange-700 shrink-0" aria-hidden="true"
                            title={t.venuePlaceholder} />
                    <span className="sr-only">{t.locationLabel}: </span>
                    <span className="line-clamp-1 font-medium flex-1">
            {event.venueGroup} {event.locationDetail && event.locationDetail !== '未指定' ? `• ${event.locationDetail}` : ''}
          </span>
                </div>
            </div>

            {/* IG secondary action */}
            {event.social?.ig && (
                <a
                    href={event.social.ig}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${event.locationDetail} Instagram`}
                    className="mt-4 flex items-center justify-center w-full gap-2 rounded-lg border border-stone-300 bg-white py-2.5 px-4 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
                >
                    <Instagram className="h-4 w-4" aria-hidden="true" />
                    <span className="line-clamp-1">{event.locationDetail}</span>
                </a>
            )}

            {/* Action */}
            {event.link && !event.isFull && (
                <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t.register} - ${event.title}`}
                    className={`${event.social?.ig ? 'mt-3' : 'mt-5'} flex items-center justify-center w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white text-sm font-bold rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600`}
                >
                    <span>{t.register}</span>
                    <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-0.5 transition-transform"
                                  aria-hidden="true" title={t.register} />
                </a>
            )}

            {event.isFull && (
                <button
                    disabled
                    aria-disabled="true"
                    className={`${event.social?.ig ? 'mt-3' : 'mt-5'} w-full py-2.5 px-4 bg-stone-200 text-stone-600 text-sm font-bold rounded-lg cursor-not-allowed border border-stone-300`}
                >
                    {t.full}
                </button>
            )}
        </article>
    );
};
