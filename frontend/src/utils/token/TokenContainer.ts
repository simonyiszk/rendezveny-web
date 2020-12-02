import { ClubRole, UserRole } from '../../interfaces';

const btoa = (str: string): string => Buffer.from(str).toString('base64');

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
  if (typeof window !== 'undefined') {
    return localStorage.getItem(authToken);
  }
  return null;
}

export function setAuthToken(_token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(authToken, _token);
  }
}

export function getEventToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(eventToken);
  }
  return null;
}

export function setEventToken(_token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(eventToken, _token);
  }
}

export function resetTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(authToken);
    localStorage.removeItem(eventToken);
    localStorage.removeItem(roleItem);
    localStorage.removeItem(eventRole);
  }
}

export function setRoleAndClubs(_role: string, roles: string[]): void {
  if (typeof window !== 'undefined') {
    if (_role === UserRole[UserRole.ADMIN]) {
      localStorage.setItem(roleItem, roleTexts.admin);
    } else if (roles.includes(ClubRole[ClubRole.CLUB_MANAGER])) {
      localStorage.setItem(roleItem, roleTexts.korvezeto);
    } else {
      localStorage.setItem(roleItem, roleTexts.tag);
    }
  }
}
export function setEventRole(isChief: boolean, isOrg: boolean): void {
  if (typeof window !== 'undefined') {
    if (isChief) {
      localStorage.setItem(eventRole, eventTexts.forendezo);
    } else if (isOrg) {
      localStorage.setItem(eventRole, eventTexts.rendezo);
    } else {
      localStorage.setItem(eventRole, eventTexts.felhasznalo);
    }
  }
}
export function isAdmin(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(roleItem) === roleTexts.admin;
  }
  return false;
}
export function isClubManager(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(roleItem) === roleTexts.korvezeto;
  }
  return false;
}
export function isLoggedin(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem(roleItem);
  }
  return false;
}
export function isChiefOrganizer(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(eventRole) === eventTexts.forendezo;
  }
  return false;
}
export function isOrganizer(): boolean {
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem(eventRole) === eventTexts.rendezo ||
      localStorage.getItem(eventRole) === eventTexts.forendezo
    );
  }
  return false;
}
