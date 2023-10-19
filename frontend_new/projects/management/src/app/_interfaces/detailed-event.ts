export interface DetailedEvent {
  id: number;
  client: number;
  name: string;
  content: any;
  start: Date;
  end: Date;
  repeating: null | 'DAY' | 'WEEK' | 'MONTH';
  repeat_every_n: null | number;
  repeating_end: null | Date;
  high_priority: boolean;
  last_modified: Date;
}
