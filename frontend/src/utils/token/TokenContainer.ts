import { ClubRole, UserRole } from '../../interfaces';

const authToken = btoa('SIMONYI_RENDEZVENY_AUTH_TOKEN');
const eventToken = btoa('SIMONYI_RENDEZVENY_EVENT_TOKEN');
const roleItem = btoa('SIMONYI_RENDEZVENY_ROLE');
const eventRole = btoa('SIMONYI_RENDEZVENY_EVENTROLE');
const roleTexts = {
  admin: btoa('RENDSZER_ADMIN'),
  korvezeto: btoa('RENDSZER_KORVEZETO'),
  tag: btoa('RENDSZER_TAG'),
};
const eventTexts = {
  forendezo: btoa('ESEMENY_FORENDEZO'),
  rendezo: btoa('ESEMENY_RENDEZO'),
  felhasznalo: btoa('ESEMENY_FELHASZNALO'),
};

export function getAuthToken(): string | null {
  return localStorage.getItem(authToken);
}

export function setAuthToken(_token: string): void {
  localStorage.setItem(authToken, _token);
}

export function getEventToken(): string | null {
  return localStorage.getItem(eventToken);
}

export function setEventToken(_token: string): void {
  localStorage.setItem(eventToken, _token);
}

export function resetTokens(): void {
  localStorage.removeItem(authToken);
  localStorage.removeItem(eventToken);
  localStorage.removeItem(roleItem);
  localStorage.removeItem(eventRole);
}

export function setRoleAndClubs(_role: string, roles: string[]): void {
  if (_role === UserRole[UserRole.ADMIN]) {
    localStorage.setItem(roleItem, roleTexts.admin);
  } else if (roles.includes(ClubRole[ClubRole.CLUB_MANAGER])) {
    localStorage.setItem(roleItem, roleTexts.korvezeto);
  } else {
    localStorage.setItem(roleItem, roleTexts.tag);
  }
}
export function setEventRole(isChief: boolean, isOrg: boolean): void {
  if (isChief) {
    localStorage.setItem(eventRole, eventTexts.forendezo);
  } else if (isOrg) {
    localStorage.setItem(eventRole, eventTexts.rendezo);
  } else {
    localStorage.setItem(eventRole, eventTexts.felhasznalo);
  }
}
export function isAdmin(): boolean {
  return localStorage.getItem(roleItem) === roleTexts.admin;
}
export function isClubManager(): boolean {
  return localStorage.getItem(roleItem) === roleTexts.korvezeto;
}
export function isChiefOrganizer(): boolean {
  return localStorage.getItem(eventRole) === eventTexts.forendezo;
}
export function isOrganizer(): boolean {
  return (
    localStorage.getItem(eventRole) === eventTexts.rendezo ||
    localStorage.getItem(eventRole) === eventTexts.forendezo
  );
}
