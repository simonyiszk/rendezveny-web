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
  access: boolean;
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
  if (access) return <>{children}</>;
  return <></>;
}
