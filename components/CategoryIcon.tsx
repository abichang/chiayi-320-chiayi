import React from 'react';
import { EventType } from '../types';
import { 
  MessageSquareText, 
  Mic, 
  Palette, 
  Footprints, 
  Store, 
  Music, 
  Users, 
  Ticket, 
  Sparkles,
  LayoutGrid
} from 'lucide-react';

interface CategoryIconProps {
  type: EventType | 'All';
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ type, className = "w-4 h-4" }) => {
  switch (type) {
    case EventType.Forum:
      return <MessageSquareText className={className} />;
    case EventType.Lecture:
      return <Mic className={className} />;
    case EventType.Workshop:
      return <Palette className={className} />;
    case EventType.Tour:
      return <Footprints className={className} />;
    case EventType.Market:
      return <Store className={className} />;
    case EventType.Performance:
      return <Music className={className} />;
    case EventType.Discussion:
      return <Users className={className} />;
    case EventType.Exhibition:
      return <Ticket className={className} />;
    case EventType.Other:
      return <Sparkles className={className} />;
    case 'All':
      return <LayoutGrid className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};