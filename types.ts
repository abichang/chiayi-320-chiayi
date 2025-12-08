export enum EventType {
  Forum = '論壇',
  Lecture = '講座',
  Workshop = '工作坊',
  Tour = '導覽/走讀',
  Market = '市集',
  Performance = '表演/DJ',
  Discussion = '市民討論',
  Exhibition = '展覽/體驗',
  Other = '其他'
}

export interface ExpoEvent {
  id: string;
  title: string;
  venueGroup: string; // The main location header (e.g., 市博願景館)
  locationDetail?: string; // Specific spot (e.g., 嘉義市政府對面)
  type: EventType;
  dateDisplay: string; // The text string for date (e.g., 12/13 六)
  dateSort: string; // ISO string for sorting (e.g., 2024-12-13)
  link?: string;
  isFull?: boolean;
  tags?: string[];
  description?: string; // For performers or extra details
}

export type ViewMode = 'venue' | 'date' | 'type' | 'calendar';

export type Language = 'zh' | 'en' | 'kr';