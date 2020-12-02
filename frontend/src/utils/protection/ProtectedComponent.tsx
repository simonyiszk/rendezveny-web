import React from 'react';

import {
  isAdmin,
  isChiefOrganizer,
  isClubManager,
  isLoggedin,
  isOrganizer,
} from '../token/TokenContainer';

export interface Props {
  children: React.ReactNode;
  access: string[];
}

const validValues = [
  'admin',
  'club_manager',
  'chieforganizer',
  'organizer',
  'member',
  'loggedin',
];

export default function ProtectedComponent({
  children,
  access,
}: Props): JSX.Element {
  if (
    (access.includes('admin') && isAdmin()) ||
    (access.includes('club_manager') && isClubManager()) ||
    (access.includes('chieforganizer') && isChiefOrganizer()) ||
    (access.includes('organizer') && isOrganizer()) ||
    (access.includes('loggedin') && isLoggedin())
  )
    return <>{children}</>;
  return <></>;
}
