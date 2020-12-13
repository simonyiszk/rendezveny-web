import { ApolloError } from '@apollo/client';

export interface Event {
  id: string;
  name: string;
  description: string;
  place: string;
  start: string;
  end: string;
  registrationStart: string;
  registrationEnd: string;
  registrationForm: EventRegistrationForm;
  isClosedEvent: boolean;
  uniqueName: string;
  registrationAllowed: boolean;
  capacity: number;
  hostingClubs: Club[];
  hrTable: HRTable;
  relations: {
    nodes: EventRelation[];
  };
  organizers: {
    nodes: EventRelation[];
  };
  chiefOrganizers: {
    nodes: EventRelation[];
  };
  selfRelation: EventRelation;
  selfRelation2: EventRelation;
}
export interface HistoryYears {
  [year: string]: Event[];
}

export interface User {
  id: string;
  name: string;
  clubMemberships: {
    nodes: Membership[];
  };
  registration: EventRegistration;
}
export enum UserRole {
  ADMIN,
  USER,
}

export interface EventRelation {
  email: string;
  isMemberOfHostingClub: boolean;
  name: string;
  organizer: EventOrganizer;
  registration: EventRegistration;
  userId: string;
}
export interface EventRegistration {
  id: string;
  didAttend: boolean;
  registrationDate: string;
  formAnswer: EventRegistrationFormAnswers;
}
export interface EventOrganizer {
  hrSegmentIds: string[];
  id: string;
  isChiefOrganizer: boolean;
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
  id: string;
  text: string;
}
export interface EventRegistrationFormInput {
  questions: EventRegistrationFormQuestionInput[];
}
export interface EventRegistrationFormQuestionInput {
  id: string;
  isRequired: boolean;
  metadata: string;
  question: string;
}
export enum EventQuestionType {
  INVALID = -1,
  TEXT,
  RADIOBUTTON,
  CHECKBOX,
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
export interface EventRegistrationFormAnswersInput {
  answers: EventRegistrationFormAnswerInput[];
}
export interface EventRegistrationFormAnswerInput {
  answer: string;
  id: string;
}

// CLUB
export interface Club {
  id: string;
  name: string;
  clubMemberships: {
    nodes: Membership[];
  };
}
export interface Membership {
  club: Club;
  role: ClubRole;
  user: User;
}
export enum ClubRole {
  CLUB_MANAGER,
  MEMBER,
}

// LOG
export interface Log {
  args: string;
  at: Date;
  id: string;
  ip: string;
  issuerId: string;
  query: string;
  result: ResultType;
  token: string;
  type: IssuerType;
}
export enum ResultType {
  BUSINESS_ERROR,
  OTHER_ERROR,
  SUCCESS,
  UNAUTHORIZED,
}
export enum IssuerType {
  PUBLIC,
  USER,
}

// HR TABLE
export interface HRTable {
  id: string;
  isLocked: boolean;
  tasks: HRTask[];
}
export interface HRTask {
  end: Date;
  id: string;
  isLocked: boolean;
  name: string;
  segments: HRSegment[];
  start: Date;
}
export interface HRSegment {
  capacity: number;
  end: Date;
  id: string;
  isLocked: boolean;
  isRequired: boolean;
  organizers: EventRelation[];
  start: Date;
}
export interface HRCallback {
  signUps: string[];
  signOffs: string[];
  signUpCb: (id: string) => void;
  signOffCb: (id: string) => void;
}
export interface HREditCallback {
  addNewSegment: (taskId: string) => void;
  editTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  editSegment: (segmentId: string) => void;
  deleteSegment: (segmentId: string) => void;
}

// UTIL
export interface MutationProps {
  onCompleted: () => void;
  onError: (error: ApolloError) => void;
  refetchQueries: any;
}
