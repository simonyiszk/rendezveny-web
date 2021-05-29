/* eslint-disable import/prefer-default-export */
import { gql } from '@urql/core';

import { setEventRole, setEventToken } from '../../utils/token/TokenContainer';

export const eventsGetTokenMutationID = gql`
  mutation getEventToken($id: String) {
    events_getToken(id: $id) {
      eventToken
      id
      relation {
        userId
        isChiefOrganizer
        isOrganizer
        isRegistered
        registration {
          id
        }
      }
    }
  }
`;

export const eventsGetTokenMutationUN = gql`
  mutation getEventToken($uniqueName: String) {
    events_getToken(uniqueName: $uniqueName) {
      eventToken
      id
      relation {
        userId
        isChiefOrganizer
        isOrganizer
        isRegistered
        registration {
          id
        }
      }
    }
  }
`;

export const setEventTokenAndRole = (data) => {
  setEventToken(data.events_getToken.eventToken);
  setEventRole(
    data.events_getToken.relation.isChiefOrganizer,
    data.events_getToken.relation.isOrganizer,
  );
};
