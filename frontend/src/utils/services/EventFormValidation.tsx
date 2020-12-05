import { Club, User } from '../../interfaces';

export function getNameValid(eventName: string): string[] {
  return eventName.length > 0 ? [] : ['Kötelező mező'];
}
export function getReglinkValid(
  regLink: string,
  allReglinks: string[],
): string[] {
  return [
    ...(regLink.length > 0 ? [] : ['Kötelező mező']),
    ...(!allReglinks.includes(regLink) ? [] : [`${regLink} már foglalt`]),
  ];
}
export function getDescriptionValid(eventDescription: string): string[] {
  return eventDescription.length > 0 ? [] : ['Kötelező mező'];
}

export function getStartValid(eventStart: Date): string[] {
  return eventStart ? [] : ['Kötelező mező'];
}
export function getEndValid(eventEnd: Date, eventStart: Date): string[] {
  return [
    ...(eventEnd ? [] : ['Kötelező mező']),
    ...(eventEnd > eventStart
      ? []
      : ['Az esemény vége későbbinek kell lennie, mint a kezdetének']),
  ];
}
export function getRegStartValid(
  eventRegStart: Date,
  eventStart: Date,
): string[] {
  return [
    ...(eventRegStart ? [] : ['Kötelező mező']),
    ...(eventRegStart <= eventStart
      ? []
      : [
          'A regisztráció a kezdetének korábbinak kell lennie, mint az esemény kezdetének',
        ]),
  ];
}
export function getRegEndValid(
  eventRegEnd: Date,
  eventRegStart: Date,
): string[] {
  return [
    ...(eventRegEnd ? [] : ['Kötelező mező']),
    ...(eventRegEnd > eventRegStart
      ? []
      : ['A regisztráció a végének későbbinek kell lennie, mint a kezdetének']),
  ];
}
export function getPlaceValid(eventPlace: string): string[] {
  return eventPlace.length > 0 ? [] : ['Kötelező mező'];
}
export function getCapacityValid(eventCapacity: number): string[] {
  return eventCapacity > 0
    ? []
    : ['A létszám korlátnak legalább 1-nek kell lennie'];
}

export function getChiefOrganizersValid(chiefOrganizers: User[]): string[] {
  return chiefOrganizers.length > 0 ? [] : ['Legalább egy főszervező kell'];
}

export function getOrganizerClubsValid(organizerClubs: Club[]): string[] {
  return organizerClubs.length > 0 ? [] : ['Legalább egy szervező kör kell'];
}
