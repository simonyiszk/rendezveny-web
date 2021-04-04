import React from 'react';

import { AccessTexts } from '../../interfaces';
import {
  isAdmin,
  isChiefOrganizer,
  isClubManager,
  isOrganizer,
} from '../token/TokenContainer';

export interface Props {
  children: React.ReactNode;
  access?: boolean;
  accessText?: AccessTexts[];
}

export default function ProtectedComponent({
  children,
  access,
  accessText,
}: Props): JSX.Element {
  if (access) return <>{children}</>;
  if (accessText) {
    if (accessText.includes('admin') && isAdmin()) {
      return <>{children}</>;
    }
    if (accessText.includes('manager') && isClubManager()) {
      return <>{children}</>;
    }
    if (accessText.includes('chief') && isChiefOrganizer()) {
      return <>{children}</>;
    }
    if (accessText.includes('organizer') && isOrganizer()) {
      return <>{children}</>;
    }
  }
  return <></>;
}
