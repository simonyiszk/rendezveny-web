export interface Event {
  id: number;
  name: string;
  description: string;
  place: string;
  start: string;
  end: string;
  registrationStart: string;
  registrationEnd: string;
  isClosedEvent: boolean;
}

export interface User {
  id: number;
  name: string;
  clubs: Club[];
}

export interface Club {
  id: number;
  name: string;
  users: User[];
}

export interface HistoryYear {
  year: number;
  events: Event[];
}

export interface FormQuestion {
  question: string;
  isRequired: boolean;
  type: string;
  order: number;
  possibleAnswers?: string[];
}
