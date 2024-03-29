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
  registrationFormAnswers: FormQuestionAnswers;
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
  alreadyRegistered: number;
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
  USER,
  ADMIN,
}

export interface EventRelation {
  email: string;
  isMemberOfHostingClub: boolean;
  name: string;
  organizer: EventOrganizer;
  registration: EventRegistration;
  userId: string;
  isChiefOrganizer: boolean;
  isOrganizer: boolean;
  isRegistered: boolean;
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
  MULTIPLE_CHOICE,
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

// FORM QUESTION ANSWER
export interface FormQuestionAnswers {
  answers: FormQuestionAnswer[];
}
export interface FormQuestionAnswer {
  formQuestionId: string;
  registrationId: string;
  answer: EventRegistrationFormAnswerMetadata;
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
  role: string;
  user: User;
}
export enum ClubRole {
  MEMBER,
  CLUB_MANAGER,
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
  hrEdit: ((task: HRTask) => void) | undefined;
  moveUp: ((task: HRTask) => void) | undefined;
  moveDown: ((task: HRTask) => void) | undefined;
}

// UTIL
export interface MutationProps {
  onCompleted: () => void;
  onError: (error: any) => void;
  refetchQueries: any;
}
export interface EventTabProps {
  name: string;
  description: string;
  start: Date;
  end: Date;
  regStart: Date;
  regEnd: Date;
  place: string;
  isClosed: boolean;
  capacity: string;
  reglink: string;
  application: boolean;
  organizers: User[];
  chiefOrganizers: User[];
  hostingClubs: Club[];
}
export interface OrganizerWorkingHours {
  organizer: User;
  hours: number;
}
export type AccessTexts =
  | 'loggedin'
  | 'admin'
  | 'manager'
  | 'organizer'
  | 'chief'
  | 'memberofhost'
  | 'managerofhost';

// Query results
export interface EventGetOneResult {
  events_getOne: Event;
}
export interface AllEventResult {
  organizedEvents: {
    nodes: Event[];
  };
  registeredEvents: {
    nodes: Event[];
  };
  availableEvents: {
    nodes: Event[];
  };
}
export interface HistoryResult {
  organizedEvents: {
    nodes: Event[];
  };
  registeredEvents: {
    nodes: Event[];
  };
}
export interface EventGetAllResult {
  events_getAll: {
    nodes: Event[];
  };
}
export interface UserGetSelfResult {
  users_getSelf: User;
}
export interface ClubGetAllResult {
  clubs_getAll: {
    nodes: Club[];
  };
}
export interface ClubGetOneResult {
  clubs_getOne: Club;
}
export interface LogsGetAllResult {
  logs_getAll: {
    nodes: Log[];
  };
}
export interface RegistrationGetOneResult {
  registration_getOne: EventRegistration;
}
export interface EventGetRegistrationFormTemplatesResult {
  events_getRegistrationFormTemplates: {
    nodes: EventRegistrationFormQuestion[];
  };
}
/* eslint-disable no-bitwise */
export enum SystemRoleTypes {
  NONE = 0,
  LOGGEDIN = 1 << 0,
  ADMIN = 1 << 1,
  MANAGER = 1 << 2,
}
export enum EventRoleTypes {
  NONE = 0,
  REGISTERED = 1 << 0,
  ATTENDED = 1 << 1,
  ORGANIZER = 1 << 2,
  CHIEF_ORGANIZER = 1 << 3,
  HOSTING_MEMBER = 1 << 4,
  HOSTING_MANAGER = 1 << 5,
}
/* eslint-enable no-bitwise */
export interface EventTokenType {
  events_getToken: {
    eventToken: string;
    id: string;
    relation: {
      userId: string;
      isChiefOrganizer: boolean;
      isOrganizer: boolean;
      isRegistered: boolean;
      isMemberOfHostingClub: boolean;
      isManagerOfHostingClub: boolean;
      registration: {
        id: string;
      };
    };
  };
}
