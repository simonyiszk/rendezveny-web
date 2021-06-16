import { gql } from '@urql/core';

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
        isMemberOfHostingClub
        isManagerOfHostingClub
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
        isMemberOfHostingClub
        isManagerOfHostingClub
        registration {
          id
        }
      }
    }
  }
`;
