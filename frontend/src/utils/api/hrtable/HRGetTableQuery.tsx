import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
} from '@apollo/client';

import { Event } from '../../../interfaces';

export const eventGetHRTableQuery = gql`
  query e_eventGetHRTable($id: String!) {
    events_getOne(id: $id) {
      id
      name
      hrTable {
        id
        isLocked
        tasks {
          id
          name
          isLocked
          segments {
            id
            start
            end
            isLocked
            isRequired
            capacity
            organizers {
              userId
              name
            }
          }
        }
      }
      selfRelation {
        userId
        organizer {
          id
          hrSegmentIds
        }
      }
    }
  }
`;
interface QueryResultL {
  events_getOne: Event;
}
export const useEventGetHRTableQuery = (
  cb: (data: QueryResultL) => void,
): QueryTuple<QueryResultL, OperationVariables> => {
  const [getQuery, data] = useLazyQuery<QueryResultL>(eventGetHRTableQuery, {
    onCompleted: cb,
    fetchPolicy: 'cache-and-network',
  });
  return [getQuery, data];
};
