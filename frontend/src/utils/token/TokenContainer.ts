import { Club, ClubRole, Membership, UserRole } from '../../interfaces';

const btoa = (str: string): string => Buffer.from(str).toString('base64');

const authToken = 'SIMONYI_RENDEZVENY_AUTH_TOKEN';
const eventToken = 'SIMONYI_RENDEZVENY_EVENT_TOKEN';
const systemRole = 'SIMONYI_RENDEZVENY_ROLE';
const clubRoles = 'SIMONYI_RENDEZVENY_CLUBROLE';
const eventRole = 'SIMONYI_RENDEZVENY_EVENTROLE';
const roleTexts = {
  admin: 'RENDSZER_ADMIN',
  tag: 'RENDSZER_TAG',
};
const eventTexts = {
  forendezo: 'ESEMENY_FORENDEZO',
  rendezo: 'ESEMENY_RENDEZO',
  felhasznalo: 'ESEMENY_FELHASZNALO',
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
    localStorage.removeItem(systemRole);
    localStorage.removeItem(clubRoles);
    localStorage.removeItem(eventRole);
  }
}

export function setRoleAndClubs(role: string, roles: Membership[]): void {
  if (typeof window !== 'undefined') {
    if (role === UserRole[UserRole.ADMIN]) {
      localStorage.setItem(systemRole, roleTexts.admin);
    } else {
      localStorage.setItem(systemRole, roleTexts.tag);
    }
    const clubRoleText = roles
      .filter((m) => m.role === ClubRole[ClubRole.CLUB_MANAGER])
      .map((m) => m.club.name)
      .join(',');
    localStorage.setItem(clubRoles, clubRoleText);
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
    return localStorage.getItem(systemRole) === roleTexts.admin;
  }
  return false;
}
export function isClubManager(): boolean {
  if (typeof window !== 'undefined') {
    const clubRolesText = localStorage.getItem(clubRoles);
    if (clubRolesText) {
      return clubRolesText.length > 0;
    }
  }
  return false;
}
export function isClubManagerOf(clubs: Club[]): boolean {
  if (typeof window !== 'undefined') {
    const clubRolesText = localStorage.getItem(clubRoles);
    if (clubRolesText) {
      return clubs.some((c) => clubRolesText.includes(c.name));
    }
  }
  return false;
}
export function isLoggedin(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem(systemRole);
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
