import React from 'react';

import { Event } from '../../interfaces';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';
import LinkButton from '../control/LinkButton';

interface Props {
  text: string;
  access: boolean;
  toPostfix: string;
  event: Event | undefined;
}

export default function ManagePageButton({
  text,
  access,
  toPostfix,
  event,
}: Props): JSX.Element {
  return (
    <ProtectedComponent access={access}>
      <LinkButton
        text={text}
        width={['100%', null, '30rem']}
        mb="1rem"
        to={`/manage/${event?.uniqueName}/${toPostfix}`}
        state={{ event }}
      />
    </ProtectedComponent>
  );
}
