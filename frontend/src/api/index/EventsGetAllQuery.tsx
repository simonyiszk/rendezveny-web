import { gql, OperationVariables, QueryResult, useQuery } from '@apollo/client';

import { Event } from '../../interfaces';

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
        uniqueName
        capacity
        alreadyRegistered
        hostingClubs {
          id
          name
        }
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
        uniqueName
        capacity
        alreadyRegistered
        hostingClubs {
          id
          name
        }
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
        uniqueName
        capacity
        alreadyRegistered
        hostingClubs {
          id
          name
        }
      }
    }
  }
`;
interface QueryResultL {
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
  cb?: (data: QueryResultL) => void,
): QueryResult<QueryResultL, OperationVariables> => {
  const getQuery = useQuery<QueryResultL>(eventGetAllQuery, {
    onCompleted: cb,
    fetchPolicy: 'cache-and-network',
  });
  return getQuery;
};
