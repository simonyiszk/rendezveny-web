export function getNameValid(eventName: string): string[] {
  return eventName.length > 0 ? [] : ['Kötelező mező'];
}

export function getStartValid(eventStart: Date): string[] {
  return eventStart ? [] : ['Kötelező mező'];
}
export function getEndValid(eventEnd: Date, eventStart: Date): string[] {
  return [
    ...(eventEnd ? [] : ['Kötelező mező']),
    ...(eventEnd > eventStart
      ? []
      : ['A szegmens kezdetének előbb kell lennie, mint a végének']),
  ];
}
