import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../../interfaces';

export const eventGetAllQuery = gql`
  query eventsGetAll {
    organizedEvents: events_getAll(isOrganizerUpcoming: true) {
      nodes {
        id
        name
        description
        place
        start
        end
        registrationStart
        registrationEnd
      }
    }
    registeredEvents: events_getAll(isRegisteredUpcoming: true) {
      nodes {
        id
        name
        description
        place
        start
        end
        registrationStart
        registrationEnd
      }
    }
    availableEvents: events_getAll(canRegisterToUpcoming: true) {
      nodes {
        id
        name
        description
        place
        start
        end
        registrationStart
        registrationEnd
      }
    }
  }
`;
interface QueryResult {
  organizedEvents: {
    nodes: Event[];
  };
  registeredEvents: {
    nodes: Event[];
  };
  availableEvents: {
    nodes: Event[];
  };
}
export const useEventGetAllQuery = (
  cb: (data: QueryResult) => void,
): QueryTuple<QueryResult, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResult>(eventGetAllQuery, {
    onCompleted: cb,
  });
  return [getQuery, data];
};
