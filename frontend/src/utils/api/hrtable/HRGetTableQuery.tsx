import {
  gql,
  OperationVariables,
  QueryResult,
  useLazyQuery,
  useQuery,
} from '@apollo/client';

import { HRTable } from '../../../interfaces';

export const eventGetHRTableQuery = gql`
  query e_eventGetHRTable {
    events_getCurrent {
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
    }
  }
`;
interface QueryResultL {
  events_getCurrent: {
    id: string;
    hrTable: HRTable;
  };
}
export const useEventGetHRTableQuery = (
  cb: (data: QueryResultL) => void,
): QueryResult<QueryResultL, OperationVariables> => {
  const getQuery = useQuery<QueryResultL>(eventGetHRTableQuery, {
    onCompleted: cb,
  });
  return getQuery;
};
