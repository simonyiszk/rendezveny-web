import { gql, OperationVariables, QueryResult, useQuery } from '@apollo/client';

import { Event } from '../../interfaces';

export const eventGetHistoryQuery = gql`
  query eventsGetHistory {
    events_getAll(isRegisteredPast: true) {
      nodes {
        id
        name
        start
        end
        place
        selfRelation2 {
          userId
          email
          organizer {
            isChiefOrganizer
          }
          registration {
            id
            didAttend
          }
        }
      }
    }
  }
`;
interface QueryResultL {
  events_getAll: {
    nodes: Event[];
  };
}
export const useEventGetHistoryQuery = (
  cb: (data: QueryResultL) => void,
): QueryResult<QueryResultL, OperationVariables> => {
  const getQuery = useQuery<QueryResultL>(eventGetHistoryQuery, {
    onCompleted: cb,
  });
  return getQuery;
};
