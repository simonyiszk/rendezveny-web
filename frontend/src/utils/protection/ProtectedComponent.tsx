import React from 'react';

import {
  isAdmin,
  isChiefOrganizer,
  isClubManager,
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
];

export default function ProtectedComponent({
  children,
  access,
}: Props): JSX.Element {
  console.log();
  if (
    true
    /* (access.includes('admin') && isAdmin()) ||
    (access.includes('club_manager') && isClubManager()) ||
    (access.includes('chieforganizer') && isChiefOrganizer()) ||
    (access.includes('organizer') && isOrganizer()) */
  )
    return <>{children}</>;
  return <></>;
}
