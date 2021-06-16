import React from 'react';

import { AccessTexts } from '../../interfaces';
import { RoleContext } from '../services/RoleContext';

export interface Props {
  children: React.ReactNode;
  accessText: AccessTexts[];
}

export default function ProtectedComponent({
  children,
  accessText,
}: Props): JSX.Element {
  return (
    <RoleContext.Consumer>
      {(value) => {
        if (
          (accessText.includes('admin') && value.isAdmin) ||
          (accessText.includes('manager') && value.isManager) ||
          (accessText.includes('organizer') && value.isOrganizer) ||
          (accessText.includes('chief') && value.isChief) ||
          (accessText.includes('memberofhost') && value.isMemberOfHost) ||
          (accessText.includes('managerofhost') && value.isManagerOfHost)
        ) {
          return <>{children}</>;
        }
        return <></>;
      }}
    </RoleContext.Consumer>
  );
}
