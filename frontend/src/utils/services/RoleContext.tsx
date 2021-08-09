/* eslint-disable no-bitwise */
import React, { createContext, useState } from 'react';

import {
  ClubRole,
  EventRoleTypes,
  EventTokenType,
  Membership,
  SystemRoleTypes,
  UserRole,
} from '../../interfaces';

interface ContextProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isOrganizer: boolean;
  isChief: boolean;
  isMemberOfHost: boolean;
  isManagerOfHost: boolean;
  setSystemRelation:
    | ((role: string, memberships: Membership[]) => void)
    | undefined;
  setEventRelation: ((data: EventTokenType) => void) | undefined;
  clearRelations: (() => void) | undefined;
}

export const RoleContext = createContext<ContextProps>({
  isLoggedIn: false,
  isAdmin: false,
  isManager: false,
  isOrganizer: false,
  isChief: false,
  isMemberOfHost: false,
  isManagerOfHost: false,
  setSystemRelation: undefined,
  setEventRelation: undefined,
  clearRelations: undefined,
});

const systemRoleToken = 'SIMONYI_RENDEZVENY_SYSTEM_ROLE';
const eventRoleToken = 'SIMONYI_RENDEZVENY_EVENT_ROLE';

interface Props {
  children: React.ReactNode;
}

export default function RoleProvider({ children }: Props): JSX.Element {
  const systemRoleFromStorage =
    typeof window !== 'undefined'
      ? localStorage.getItem(systemRoleToken)
      : undefined;
  const eventRoleFromStorage =
    typeof window !== 'undefined'
      ? localStorage.getItem(eventRoleToken)
      : undefined;

  const [systemRole, setSystemRole] = useState(
    systemRoleFromStorage ? parseInt(systemRoleFromStorage, 10) : 0,
  );
  const [eventRole, setEventRole] = useState(
    eventRoleFromStorage ? parseInt(eventRoleFromStorage, 10) : 0,
  );

  const isMatch = (value: number, reference: number): boolean => {
    return (value & reference) === reference;
  };
  const setSystemRelation = (role: string, memberships: Membership[]): void => {
    let relation = SystemRoleTypes.LOGGEDIN;
    if (role === UserRole[UserRole.ADMIN]) relation |= SystemRoleTypes.ADMIN;
    if (memberships.some((m) => m.role === ClubRole[ClubRole.CLUB_MANAGER]))
      relation |= SystemRoleTypes.MANAGER;

    if (typeof window !== 'undefined') {
      localStorage.setItem(systemRoleToken, relation.toString());
    }
    setSystemRole(relation);
  };
  const setEventRelation = (data: EventTokenType): void => {
    let relation = 0;
    if (data.events_getToken.relation.isChiefOrganizer)
      relation |= EventRoleTypes.CHIEF_ORGANIZER;
    if (data.events_getToken.relation.isOrganizer)
      relation |= EventRoleTypes.ORGANIZER;
    if (data.events_getToken.relation.isRegistered)
      relation |= EventRoleTypes.REGISTERED;
    if (data.events_getToken.relation.isMemberOfHostingClub)
      relation |= EventRoleTypes.HOSTING_MEMBER;
    if (data.events_getToken.relation.isManagerOfHostingClub)
      relation |= EventRoleTypes.HOSTING_MANAGER;

    if (typeof window !== 'undefined') {
      localStorage.setItem(eventRoleToken, relation.toString());
    }
    setEventRole(relation);
  };
  const clearRelations = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(systemRoleToken);
      localStorage.removeItem(eventRoleToken);
    }
    setSystemRole(0);
    setEventRole(0);
  };
  return (
    <RoleContext.Provider
      value={{
        isLoggedIn: isMatch(systemRole, SystemRoleTypes.LOGGEDIN),
        isAdmin: isMatch(systemRole, SystemRoleTypes.ADMIN),
        isManager: isMatch(systemRole, SystemRoleTypes.MANAGER),
        isOrganizer: isMatch(eventRole, EventRoleTypes.ORGANIZER),
        isChief: isMatch(eventRole, EventRoleTypes.CHIEF_ORGANIZER),
        isMemberOfHost: isMatch(eventRole, EventRoleTypes.HOSTING_MEMBER),
        isManagerOfHost: isMatch(eventRole, EventRoleTypes.HOSTING_MANAGER),
        setSystemRelation,
        setEventRelation,
        clearRelations,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}
