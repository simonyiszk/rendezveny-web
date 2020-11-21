export interface Event {
  id: number;
  name: string;
  description: string;
  place: string;
  start: string;
  end: string;
  registrationStart: string;
  registrationEnd: string;
  registrationForm: EventRegistrationForm;
  isClosedEvent: boolean;
  relations: EventRelation[];
  selfRelation: {
    registration: EventRegistration;
  };
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

export interface EventRelation {
  email: string;
  isMemberOfHostingClub: boolean;
  name: string;
  // organizer: EventOrganizerDTO
  registration: EventRegistration;
  userId: string;
}

export interface EventRegistration {
  id: number;
  didAttend: boolean;
  formAnswer: EventRegistrationFormAnswers;
}

// QUESTIONS
export interface EventRegistrationForm {
  questions: EventRegistrationFormQuestion[];
}
export interface EventRegistrationFormQuestion {
  id: string;
  isRequired: boolean;
  metadata: EventRegistrationFormQuestionMetadata;
  question: string;
}
export type EventRegistrationFormQuestionMetadata =
  | EventRegistrationFormMultipleChoiceQuestion
  | EventRegistrationFormTextQuestion;
export interface EventRegistrationFormMultipleChoiceQuestion {
  multipleAnswers: boolean;
  options: EventRegistrationFormMultipleChoiceOption[];
  type: string;
}
export interface EventRegistrationFormTextQuestion {
  maxLength: number;
  type: string;
}
export interface EventRegistrationFormMultipleChoiceOption {
  id: number;
  text: string;
}

// ANSWERS
export interface EventRegistrationFormAnswers {
  answers: EventRegistrationFormAnswer[];
}
export interface EventRegistrationFormAnswer {
  id: string;
  answer: EventRegistrationFormAnswerMetadata;
}
export type EventRegistrationFormAnswerMetadata =
  | EventRegistrationFormMultipleChoiceAnswer
  | EventRegistrationFormTextAnswer;
export interface EventRegistrationFormMultipleChoiceAnswer {
  type: string;
  options: string[];
}
export interface EventRegistrationFormTextAnswer {
  type: string;
  text: string;
}
