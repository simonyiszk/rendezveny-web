export interface Event {
  id: number;
  name: string; // TODO
  startDate: string;
}

export interface HistoryYear {
  year: number;
  events: Event[];
}
